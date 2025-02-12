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

/*******************Chat routes*********************** */
router.post("/create", authenticateUser, createBinaryChat);
router.get("/", authenticateUser, getAllchats);
router.get("/findChatId", authenticateUser, findChatId);
router.get("/userChat/:userId", authenticateUser, getUserChats);
router.post("/send", authenticateUser, sendMessage); //{ senderId, content }
router.get("/messages/:chatId", authenticateUser, getMessages);
router.post("/chat/:chatId/read/:messageId", readMessageUpdate); //{userId}
router.delete("/messages/delete/:messageId", authenticateUser, deleteMessage);
router.delete("delete/:chatId", authenticateUser, deleteChat);

export default router;
