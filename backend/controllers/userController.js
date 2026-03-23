import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password, bio, avatar } = req.body;

    // Default emoji avatars pool
    const defaultAvatars = ['😀', '😎', '🥳', '😊', '🤗', '🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦄', '🌟', '⚡', '🎨', '🎭', '🎪'];

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

        // Assign random default avatar if none provided
        const userAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio, avatar: userAvatar
        })

        const token = generateToken(newUser._id)
        res.json({ success: true, userData: newUser, token, message: "Account created successfully" })
    } catch (error) {
        console.error("[Signup Error]", error.message, error.stack)
        return res.json({ success: false, message: error.message || "Signup failed. Please try again." });
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

        // Safety check: ensure user has a password set
        if (!userData.password) {
            return res.json({ success: false, message: "Password not set for this account. Please use another login method or reset your password." })
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = generateToken(userData._id)
        res.json({ success: true, userData, token, message: "Login successful" })
    } catch (error) {
        console.error("[Login Error]", error.message, error.stack)
        res.json({ success: false, message: error.message || "Login failed. Please try again." })
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

// Update avatar controller
export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const userId = req.user._id;

        console.log('[updateAvatar] Received avatar:', JSON.stringify(avatar, null, 2));
        console.log('[updateAvatar] Avatar type:', typeof avatar);
        console.log('[updateAvatar] User ID:', userId);

        if (!avatar) {
            console.log('[updateAvatar] Avatar is missing');
            return res.json({ success: false, message: "Avatar is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar },
            { new: true }
        ).select('-password');

        console.log('[updateAvatar] User updated successfully:', updatedUser.fullName);
        console.log('[updateAvatar] New avatar:', JSON.stringify(updatedUser.avatar, null, 2));

        res.json({ success: true, user: updatedUser, message: "Avatar updated successfully" });
    } catch (error) {
        console.error('[updateAvatar] ERROR:', error.message);
        console.error('[updateAvatar] Full error:', error);
        res.json({ success: false, message: error.message || "Error occurred while updating avatar" });
    }
}
