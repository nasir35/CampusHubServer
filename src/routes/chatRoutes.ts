import express from "express";
import {
  getUserChats,
  sendMessage,
  getMessages,
  getAllchats,
  findChatId,
  createBinaryChat,
  readMessageUpdate,
  deleteMessage,
  deleteChat,
} from "../controllers/chatControllers"; // Import your controller methods
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

// Route to create a chat between two users
router.post("/create", authenticateUser, createBinaryChat);

router.get("/", authenticateUser, getAllchats);

router.get("/findChatId", authenticateUser, findChatId);

// Route to get chats of a user
router.get("/userChat/:userId", authenticateUser, getUserChats);

// Route to send a message in a chat
router.post("/send", authenticateUser, sendMessage); //{ senderId, content }

// Route to get all messages in a chat
router.get("/messages/:chatId", authenticateUser, getMessages);

// Route to read updates in a chat
router.post("/chat/:chatId/read/:messageId", readMessageUpdate); //{userId}

router.delete("/messages/delete/:messageId", authenticateUser, deleteMessage);

router.delete("delete/:chatId", authenticateUser, deleteChat);

export default router;
