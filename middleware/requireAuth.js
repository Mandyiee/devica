import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import dotenv from 'dotenv';

dotenv.config();

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    
    if (!authorization) {
        console.log("No authorization header found");
        return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authorization.split(' ')[1];
    
    if (!token) {
        console.log("Token is missing or malformed");
        return res.status(401).json({ error: 'Authorization token is missing or malformed' });
    }
    
    try {
       // console.log("Token received:", token); // Debugging
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
       // console.log("Decoded token payload:", decoded); // Debugging
        
        const user = await User.findOne({ _id: decoded.userId }).select('_id');
        //console.log("Database query result:", user); // Debugging
        
        if (!user) {
            console.log("User not found in database");
            return res.status(401).json({ error: "User not found" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth Error:", error);
        res.status(401).json({ error: "Request is not authorized" });
    }
};

export default requireAuth;