import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;


    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })

        const token = generateToken(newUser._id)
        res.json({ success: true, userData: newUser, token, message: "Account created successfully" })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: "Error occurred" });
    }
};

//controllers
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Missing credentials" });
        }

        const userData = await User.findOne({ email })

        if (!userData) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = generateToken(userData._id)
        res.json({ success: true, userData, token, message: "Login successful" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Error occurred" })
    }
}
//controllers authenticated

export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

//controllers to update user profile

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id;
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }
        res.json({ success: true, user: updatedUser })
    }
    catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Logout controller
export const logout = async (req, res) => {
    try {
        // Since we're using JWT with localStorage, logout is handled client-side
        // This endpoint can be used for logging/analytics or token blacklisting if needed
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error occurred" });
    }
}

// Delete account controller
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete user from database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error occurred while deleting account" });
    }
}
