"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_1 = require("../controllers/chatControllers"); // Import your controller methods
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/*******************Chat routes*********************** */
router.post("/create", authMiddleware_1.authenticateUser, chatControllers_1.createBinaryChat);
router.get("/", authMiddleware_1.authenticateUser, chatControllers_1.getAllchats);
router.get("/findChatId", authMiddleware_1.authenticateUser, chatControllers_1.findChatId);
router.get("/userChat/:userId", authMiddleware_1.authenticateUser, chatControllers_1.getUserChats);
router.post("/send", authMiddleware_1.authenticateUser, chatControllers_1.sendMessage); //{ senderId, content }
router.get("/messages/:chatId", authMiddleware_1.authenticateUser, chatControllers_1.getMessages);
router.post("/chat/:chatId/read/:messageId", chatControllers_1.readMessageUpdate); //{userId}
router.delete("/messages/delete/:messageId", authMiddleware_1.authenticateUser, chatControllers_1.deleteMessage);
router.delete("delete/:chatId", authMiddleware_1.authenticateUser, chatControllers_1.deleteChat);
exports.default = router;
