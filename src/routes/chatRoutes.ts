import express from "express";
import { createChat, getUserChats, sendMessage, getMessages } from "../controllers/chatControllers"; // Import your controller methods

const router = express.Router();

// Route to create a chat between two users
router.post("/create", createChat);

// Route to get chats of a user
router.get("/:userId", getUserChats);

// Route to send a message in a chat
router.post("/:chatId/message", sendMessage);

// Route to get all messages in a chat
router.get("/:chatId/messages", getMessages);

export default router;
