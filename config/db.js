import mongoose from "mongoose";

import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
    try {
        await mongoose.connect(uri, clientOptions);
        console.log("Successfully connected to MongoDB!");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
            connectDB();
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    }
}

export default connectDB;

