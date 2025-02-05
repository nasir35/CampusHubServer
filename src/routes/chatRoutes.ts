import express from "express";
import { createChat, getUserChats, sendMessage, getMessages } from "./../controllers/chatControllers";

const router = express.Router();

router.post("/chat", createChat); // Create a chat
router.get("/chats/:userId", getUserChats); // Get user chats
router.post("/message", sendMessage); // Send a message
router.get("/messages/:chatId", getMessages); // Get messages of a chat

export default router;
