import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getConversations, searchUsers, markMessageAsSeen, sendMessage, editMessage, deleteMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();
messageRouter.get("/conversations", protectRoute, getConversations);
messageRouter.get("/search", protectRoute, searchUsers);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/edit/:id", protectRoute, editMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);
messageRouter.put("/seen/:id", protectRoute, markMessageAsSeen);

export default messageRouter;
