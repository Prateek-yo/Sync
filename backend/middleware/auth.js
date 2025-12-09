import User from "../models/User.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
    try {
        // Support both Authorization header and custom token header
        let token = req.headers.authorization?.split(' ')[1] || req.headers.token;

        if (!token) {
            return res.json({ success: false, message: "No token provided" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user)
            return res.json({ success: false, message: "User not found" })

        req.user = user;
        next();
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Invalid or expired token" })
    }
}



