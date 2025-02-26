// server.js
import express from 'express';
import http from 'node:http';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import Device from './model/device.js';

import dotenv from 'dotenv';

dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'HEAD', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add existing routes
app.use('/user', userRoutes);
app.use('/device', deviceRoutes);

app.get('/', (req, res) => {
  return res.send("Welcome");
})

// In-memory storage for device data and commands
const connectedDevices = new Map(); // Stores device connection status and timestamp
const deviceData = new Map(); // Stores the latest data from each device
const pendingCommands = new Map(); // Stores commands waiting to be picked up by devices

// Utility to check and clean up inactive devices
const cleanInactiveDevices = () => {
  const now = Date.now();
  for (const [deviceId, connectionInfo] of connectedDevices.entries()) {
    // If device hasn't connected in the last 30 seconds, mark as disconnected
    if (now - connectionInfo.lastSeen > 30000) {
      connectionInfo.isConnected = false;
    }
  }
};

// Run cleanup every 30 seconds
setInterval(cleanInactiveDevices, 30000);

// API Endpoints

// 1. Device Connect Notification
app.post('/api/device-connect', async (req, res) => {
  try {
    const { deviceId, type } = req.body;
    
    if (type !== 'deviceConnect' || !deviceId) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Update device connection status
    connectedDevices.set(deviceId, {
      isConnected: true,
      lastSeen: Date.now()
    });
    
    console.log(`Device ${deviceId} connected`);
    return res.status(200).json({ message: 'Device connected successfully' });
  } catch (error) {
    console.error('Error in device connection:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Receive sensor data from ESP32
app.post('/api/device-data', async (req, res) => {
  try {
    const { deviceId, type, name, status, data } = req.body;
    
    if (type !== 'deviceData' || !deviceId || !name) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Update device's last seen timestamp
    const deviceInfo = connectedDevices.get(deviceId);
    if (deviceInfo) {
      deviceInfo.lastSeen = Date.now();
      connectedDevices.set(deviceId, deviceInfo);
    } else {
      connectedDevices.set(deviceId, {
        isConnected: true,
        lastSeen: Date.now()
      });
    }
    
    // Store the latest component data
    if (!deviceData.has(deviceId)) {
      deviceData.set(deviceId, new Map());
    }
    
    const deviceComponents = deviceData.get(deviceId);
    deviceComponents.set(name, { name, status, data });
    
    console.log(`Received data from device ${deviceId} for component ${name}`);
    return res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error processing device data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Dashboard polls for device data
app.get('/api/device-data/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Check if device exists
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Get connection status
    const connectionInfo = connectedDevices.get(deviceId);
    const isConnected = connectionInfo ? connectionInfo.isConnected : false;
    
    // Get all component data for the device
    const components = [];
    if (deviceData.has(deviceId)) {
      const deviceComponents = deviceData.get(deviceId);
      for (const component of deviceComponents.values()) {
        components.push(component);
      }
    }
    
    return res.status(200).json({
      deviceId,
      isConnected,
      components
    });
  } catch (error) {
    console.error('Error fetching device data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Send command to device
app.post('/api/send-command', async (req, res) => {
  try {
    const { deviceId, name, status } = req.body;
    
    if (!deviceId || !name || status === undefined) {
      return res.status(400).json({ error: 'Invalid command format' });
    }
    
    // Store command for device to pick up
    if (!pendingCommands.has(deviceId)) {
      pendingCommands.set(deviceId, []);
    }
    
    const commands = pendingCommands.get(deviceId);
    commands.push({ name, status, timestamp: Date.now() });
    
    console.log(`Command queued for device ${deviceId}, component ${name}: ${status}`);
    return res.status(200).json({ message: 'Command sent successfully' });
  } catch (error) {
    console.error('Error sending command:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. ESP32 polls for commands
app.get('/api/device-commands/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Update device's last seen timestamp
    const deviceInfo = connectedDevices.get(deviceId);
    if (deviceInfo) {
      deviceInfo.lastSeen = Date.now();
      deviceInfo.isConnected = true;
      connectedDevices.set(deviceId, deviceInfo);
    } else {
      connectedDevices.set(deviceId, {
        isConnected: true,
        lastSeen: Date.now()
      });
    }
    
    // Get pending commands for the device
    const commands = pendingCommands.get(deviceId) || [];
    
    // Clear the pending commands after sending
    pendingCommands.set(deviceId, []);
    
    return res.status(200).json({ commands });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 6. Receive command confirmation from ESP32
app.post('/api/component-update', async (req, res) => {
  try {
    const { deviceId, type, name, status } = req.body;
    
    if (type !== 'updateComponent' || !deviceId || !name || status === undefined) {
      return res.status(400).json({ error: 'Invalid update format' });
    }
    
    // Update component status in device data
    if (deviceData.has(deviceId)) {
      const deviceComponents = deviceData.get(deviceId);
      const component = deviceComponents.get(name);
      
      if (component) {
        component.status = status;
        deviceComponents.set(name, component);
      } else {
        deviceComponents.set(name, { name, status });
      }
    } else {
      const newComponentMap = new Map();
      newComponentMap.set(name, { name, status });
      deviceData.set(deviceId, newComponentMap);
    }
    
    console.log(`Component update from device ${deviceId} for ${name}: ${status}`);
    return res.status(200).json({ message: 'Component update successful' });
  } catch (error) {
    console.error('Error processing component update:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(8000, () => {
  console.log('Server listening on port 8000');
});

