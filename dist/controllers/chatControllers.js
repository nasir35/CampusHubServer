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
const Chat_1 = require("../models/Chat");
const Message_1 = require("../models/Message");
const notificationController_1 = require("./notificationController");
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const User_1 = require("../models/User");
// Create a chat between two users
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    try {
        // Check if a chat between these users already exists
        const existingChat = yield Chat_1.Chat.findOne({
            members: { $all: [senderId, receiverId] },
        });
        if (existingChat) {
            return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });
        }
        // Create new chat document
        const newChat = new Chat_1.Chat({ members: [senderId, receiverId] });
        yield newChat.save();
        // Add chat reference to both users
        yield User_1.User.findByIdAndUpdate(senderId, { $push: { chats: newChat._id } });
        yield User_1.User.findByIdAndUpdate(receiverId, { $push: { chats: newChat._id } });
        res.status(201).json({ success: true, message: "Chat has been created", data: newChat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating chat", data: error });
    }
});
exports.createChat = createChat;
// Get chats of a user
const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield Chat_1.Chat.find({ members: req.params.userId });
        return res.status(200).json({ success: true, message: "Chats found", data: chats });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching chats" });
    }
});
exports.getUserChats = getUserChats;
// Send a message
exports.sendMessage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, chatId, content } = req.body;
    // Find the chat
    const chat = yield Chat_1.Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }
    // Create the new message
    const newMessage = new Message_1.Message({
        sender: senderId,
        content,
        chatId: chat._id,
        readBy: [], // Initially no one has read the message
    });
    // Save the message in the Message collection
    yield newMessage.save();
    // Notify chat participants (excluding the sender)
    chat.members.forEach((participant) => __awaiter(void 0, void 0, void 0, function* () {
        if (participant.toString() !== senderId.toString()) {
            yield (0, notificationController_1.createNotification)(participant.toString(), senderId, "New Message", "You have a new message.", `/chat/${chatId}` // Link to the chat
            );
        }
    }));
    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
}));
// Get messages of a chat
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, message: "Messages fetched successfully", data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
});
exports.getMessages = getMessages;
