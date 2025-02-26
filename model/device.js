import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
            user_id: {
                type: String,
                required: [true, "Please provide an id"],
            },
            name: {
                type: String,
                required:[true, "Please input a device name"],
            },
            deviceType: {
                type: String,
                required:[true, "Please input the type of your device"],
            },
            components: [
                {
                    name: String,
                    label: String,
                    component : String,
                     rowSpan: Number, 
                     colSpan: Number,
                    status: Number
                },
            ],
        
});

const Device = mongoose.model('Device', deviceSchema);

export default Device;