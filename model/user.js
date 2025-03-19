import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Device from './device.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.pre("save", async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.post("save", async function(doc) {
  if (this.isNew) {
    try {
    

      // Bio Tracking System Components (ESP32)
      const bioTrackingComponents = [
        {
          "name": "heartRate",
          "label": "Heart Rate",
          "component": "LabelDisplay",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 72,
          "color": '#ff8c42',
          "icon": "health" // Updated icon
        },
        {
          "name": "bloodOxygen",
          "label": "Blood Oxygen",
          "component": "SemiRadial",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 96,
          "color": '#3399ff',
          "icon": "health" // Updated icon
        },
        {
          "name": "bodyTemp",
          "label": "Body Temperature",
          "component": "RadialRange",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 37,
          "color": '#ff8c42',
          "icon": "temperature" // Updated icon
        },
        {
          "name": "stepCount",
          "label": "Steps",
          "component": "VerticalLabel",
          "rowSpan": 2,
          "colSpan": 1,
          "status": 84,
          "color": '#4CAF50',
          "icon": "metrics" // Updated icon
        },
        {
          "name": "sleepQuality",
          "label": "Sleep Quality",
          "component": "CircularRange",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 85,
          "color": '#00cc99',
          "icon": "history" // Updated icon
        },
        {
          "name": "dailyActivity",
          "label": "Activity",
          "component": "AreaCharts",
          "rowSpan": 1,
          "colSpan": 3,
          "status": 65,
          "color": '#00cc99',
          "icon": "statistics" // Updated icon
        }
      ];

      // Home Automation Components (Arduino)
      const homeAutomationComponents = [
        {
          "name": "livingRoomTemp",
          "label": "Living Room",
          "component": "LabelDisplay",
          "rowSpan": 1,
          "colSpan": 2,
          "status": 23,
          "color": '#ff8c42',
          "icon": "temperature" // Updated icon
        },
        {
          "name": "powerConsumption",
          "label": "Power Usage",
          "component": "AreaCharts",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 76,
          "color": '#ff8c42',
          "icon": "power" // Updated icon
        },
        {
          "name": "lightControl",
          "label": "Lights",
          "component": "LabelToggle",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 1,
          "color": '#ff8c42',
          "icon": "lights" // Updated icon
        },
        {
          "name": "securityStatus",
          "label": "Security",
          "component": "RadialLabel",
          "rowSpan": 2,
          "colSpan": 1,
          "status": 100,
          "color": '#4CAF50',
          "icon": "security" // Updated icon
        },
        {
          "name": "doorStatus",
          "label": "Doors",
          "component": "HorizontalLabel",
          "rowSpan": 1,
          "colSpan": 2,
          "status": 0,
          "color": '#3399ff',
          "icon": "sensors" // Updated icon
        },
        {
          "name": "airQuality",
          "label": "Air Quality",
          "component": "CircularRange",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 87,
          "color": '#4CAF50',
          "icon": "weather" // Updated icon
        }
      ];

      // Smart Farming System Components (Raspberry Pi)
      const smartFarmingComponents = [
        {
          "name": "soilMoisture",
          "label": "Soil Moisture",
          "component": "SemiRadial",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 68,
          "color": '#00cc99',
          "icon": "soilMoisture" // Updated icon
        },
        {
          "name": "temperature",
          "label": "Temperature",
          "component": "RadialRange",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 26,
          "color": '#ff8c42',
          "icon": "temperature" // Updated icon
        },
        {
          "name": "humidity",
          "label": "Humidity",
          "component": "VerticalLabel",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 75,
          "color": '#3399ff',
          "icon": "humidity" // Updated icon
        },
        {
          "name": "lightIntensity",
          "label": "Light",
          "component": "CircularRange",
          "rowSpan": 2,
          "colSpan": 1,
          "status": 82,
          "color": '#ff8c42',
          "icon": "sunlight" // Updated icon
        },
        {
          "name": "waterLevel",
          "label": "Water Tank",
          "component": "VerticalLabel",
          "rowSpan": 2,
          "colSpan": 1,
          "status": 65,
          "color": '#3399ff',
          "icon": "waterLevel" // Updated icon
        },
        {
          "name": "cropYield",
          "label": "Yield Forecast",
          "component": "BarCharts",
          "rowSpan": 1,
          "colSpan": 3,
          "status": 92,
          "color": '#4CAF50',
          "icon": "statistics" // Updated icon
        },
        {
          "name": "systemLogs",
          "label": "System Logs",
          "component": "Terminal",
          "rowSpan": 1,
          "colSpan": 2,
          "status": 0,
          "color": '#3399ff',
          "icon": "logs" // Updated icon
        }
      ];

      // Geo Tracking System Components (STM32)
      const geoTrackingComponents = [
        {
          "name": "currentLocation",
          "label": "Current Location",
          "component": "Location",
          "rowSpan": 2,
          "colSpan": 2,
          "status": 0,
          "color": '#3399ff',
          "icon": "location" // Updated icon
        },
        {
          "name": "speed",
          "label": "Speed",
          "component": "LabelDisplay",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 65,
          "color": '#ff8c42',
          "icon": "metrics" // Updated icon
        },
        {
          "name": "altitude",
          "label": "Altitude",
          "component": "VerticalLabel",
          "rowSpan": 2,
          "colSpan": 1,
          "status": 48,
          "color": '#00cc99',
          "icon": "sensors" // Updated icon
        },
        {
          "name": "batteryLevel",
          "label": "Battery",
          "component": "RadialRange",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 83,
          "color": '#4CAF50',
          "icon": "battery" // Updated icon
        },
        {
          "name": "travelDistance",
          "label": "Distance",
          "component": "HorizontalLabel",
          "rowSpan": 1,
          "colSpan": 2,
          "status": 32,
          "color": '#ff8c42',
          "icon": "tracking" // Updated icon
        },
        {
          "name": "signalStrength",
          "label": "Signal",
          "component": "SemiRadial",
          "rowSpan": 1,
          "colSpan": 1,
          "status": 75,
          "color": '#3399ff',
          "icon": "connectivity" // Updated icon
        },
        {
          "name": "movementHistory",
          "label": "Movement History",
          "component": "AreaCharts",
          "rowSpan": 1,
          "colSpan": 4,
          "status": 0,
          "color": '#3399ff',
          "icon": "history" // Updated icon
        }
      ];

      const devices = [
        {
          user_id: doc._id.toString(),
          name: "Bio Tracking System",
          deviceType: "esp32",
          components: bioTrackingComponents
        },
        {
          user_id: doc._id.toString(),
          name: "Home Automation",
          deviceType: "Arduino",
          components: homeAutomationComponents
        },
        {
          user_id: doc._id.toString(),
          name: "Smart Farming System",
          deviceType: "raspberry pi",
          components: smartFarmingComponents
        },
        {
          user_id: doc._id.toString(),
          name: "Geo Tracking System",
          deviceType: "stm32",
          components: geoTrackingComponents
        }
      ];

      // Create all four devices in parallel
      const result = await Promise.all(
        devices.map(device => Device.create(device))
      );

      console.log(`Created ${result.length} devices with components for user ${doc._id}`);
    } catch (error) {
      console.error("Error creating default devices:", error);
    }
  }
});

const User = mongoose.model('User', userSchema);

export default User;