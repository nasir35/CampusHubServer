"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_1 = require("./../controllers/chatControllers");
const router = express_1.default.Router();
router.post("/chat", chatControllers_1.createChat); // Create a chat
router.get("/chats/:userId", chatControllers_1.getUserChats); // Get user chats
router.post("/message", chatControllers_1.sendMessage); // Send a message
router.get("/messages/:chatId", chatControllers_1.getMessages); // Get messages of a chat
exports.default = router;
