import express from "express";
import { getUserChats, sendMessage, getMessages, getAllchats, findChatId, createBinaryChat, readMessageUpdate } from "../controllers/chatControllers"; // Import your controller methods

const router = express.Router();

// Route to create a chat between two users
router.post("/create", createBinaryChat);

router.get("/", getAllchats);

router.get("/findChatId", findChatId);

// Route to get chats of a user
router.get("/:userId", getUserChats);

// Route to send a message in a chat
router.post("/send/:chatId", sendMessage); //{ senderId, content }

// Route to get all messages in a chat
router.get("/messages/:chatId", getMessages);

// Route to read updates in a chat
router.post("/chat/:chatId/read/:messageId", readMessageUpdate) //{userId}

export default router;
