import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage, editMessage, deleteMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.put("/edit/:id", protectRoute, editMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);
messageRouter.get("/:id", protectRoute, getMessages);


export default messageRouter;
