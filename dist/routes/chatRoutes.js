"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_1 = require("../controllers/chatControllers"); // Import your controller methods
const router = express_1.default.Router();
// Route to create a chat between two users
router.post("/create", chatControllers_1.createChat);
// Route to get chats of a user
router.get("/:userId", chatControllers_1.getUserChats);
// Route to send a message in a chat
router.post("/:chatId/message", chatControllers_1.sendMessage);
// Route to get all messages in a chat
router.get("/:chatId/messages", chatControllers_1.getMessages);
exports.default = router;
