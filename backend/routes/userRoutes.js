import express from "express";
import { checkAuth, login, signup, updateProfile, logout, deleteAccount } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.delete("/delete-account", protectRoute, deleteAccount);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;