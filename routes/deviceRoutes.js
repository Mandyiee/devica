import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import Device from "../model/device.js";

const router = express.Router();

router.use(requireAuth);

router.post('/add', async (req, res) => {
    try {
    const { device_name, device_type } = req.body;

    if( device_name && device_type ) {
        let deviceExists = await Device.findOne({ device_name })
        if (deviceExists) {
            return res.status(400).json({ error: "Device's name already exists" });
        }
        const user_id = req.user._id;
         const device = await Device.create({
            user_id,
            name: device_name,
            deviceType: device_type
        })
        if (device) {
            res.status(201).json({
                id: String(device._id),
            })
        } else {
            res.status(400).json({
                error: "A new device could not be created",
            })
        }
    } else {
        res.status(400).json({
            error: "Invalid input",
        })
    }
} catch (error) {
  
        res.status(500).json({
            error: "Server error",
        })
    
}
})

router.get('/all', async (req, res) => {
    const user_id = req.user._id;
    try {
        console.log("getting devices for:",user_id)
        const devices = await Device.find({ user_id }).select('name _id deviceType'); 
        res.json(devices); 
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const device = await Device.findById(id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ name: device.name, type: device.deviceType,components: device.components });
    } catch (error) {
        console.error('Error fetching components:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { components } = req.body;

    if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'Invalid components data' });
    }

    try {
        const updatedDevice = await Device.findByIdAndUpdate(
            id,
            { components },
            { new: true, runValidators: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ error: 'Device not foundS' });
        }

        res.json({ message: 'Components updated successfully', device: updatedDevice });
    } catch (error) {
        console.error('Error updating components:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
