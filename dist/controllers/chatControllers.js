"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = exports.getUserChats = exports.createChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = require("./../models/Message");
// Create a chat between two users
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    try {
        const existingChat = yield Chat_1.default.findOne({
            members: { $all: [senderId, receiverId] },
        });
        if (existingChat)
            return res.status(200).json(existingChat);
        const newChat = new Chat_1.default({ members: [senderId, receiverId] });
        yield newChat.save();
        res.status(201).json(newChat);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating chat", error });
    }
});
exports.createChat = createChat;
// Get chats of a user
const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield Chat_1.default.find({ members: req.params.userId });
        return res.status(200).json(chats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching chats", error });
    }
});
exports.getUserChats = getUserChats;
// Send a message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, senderId, text } = req.body;
    try {
        const message = new Message_1.Message({ chatId, sender: senderId, text });
        yield message.save();
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
});
exports.sendMessage = sendMessage;
// Get messages of a chat
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.Message.find({ chatId: req.params.chatId });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
});
exports.getMessages = getMessages;
