import express from "express";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
            })
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ userId: user._id}, process.env.SECRET_KEY, {
                expiresIn: '30d',
              });
            
              res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token : token
              })
            
        } else {
            res.status(401).json({error: "Invalid email or password"});
        }

    } catch (error) {
        res.status(500).json({error: error.message});
    }
})
export default router;
