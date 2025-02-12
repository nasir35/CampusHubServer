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
exports.deleteMessage = exports.readMessageUpdate = exports.deleteChat = exports.getMessages = exports.sendMessage = exports.getUserChats = exports.getAllchats = exports.findChatId = exports.createBinaryChat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const findChatBetweenUsers_1 = require("../utils/findChatBetweenUsers");
const Message_1 = require("../models/Message");
const createBinaryChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res
            .status(400)
            .json({ success: false, message: "Both senderId and receiverId are required." });
    }
    try {
        // Check if a binary chat already exists
        const existingChat = yield Chat_1.Chat.findOne({
            isGroup: false,
            members: { $all: [senderId, receiverId] },
        });
        if (existingChat) {
            return res
                .status(200)
                .json({ success: true, message: "Chat already exists", data: existingChat });
        }
        // Create new binary chat
        const newChat = new Chat_1.Chat({ isGroup: false, members: [senderId, receiverId] });
        yield newChat.save();
        // Add chat reference to both users
        yield User_1.User.findByIdAndUpdate(senderId, { $push: { chats: newChat._id } });
        yield User_1.User.findByIdAndUpdate(receiverId, { $push: { chats: newChat._id } });
        res.status(201).json({ success: true, message: "Binary Chat created", data: newChat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating chat", data: error });
    }
});
exports.createBinaryChat = createBinaryChat;
const findChatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId } = req.body;
        const existingChat = yield (0, findChatBetweenUsers_1.findChatBetweenUsers)(senderId, receiverId);
        if (!existingChat) {
            return res.status(404).json({ success: false, message: "Chat doesn't exists" });
        }
        return res
            .status(200)
            .json({ success: true, message: "ChatId found successfully.", data: existingChat._id });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "ChatId fetching error!" });
    }
});
exports.findChatId = findChatId;
const getAllchats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield Chat_1.Chat.find().sort({ createdAt: -1 });
        return res
            .status(200)
            .json({ success: true, message: `${chats.length} Chats founds.`, data: chats });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Chats fetching error!" });
    }
});
exports.getAllchats = getAllchats;
// Get chats of a user
const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Find all chats where the user is a member
        const chats = yield Chat_1.Chat.find({ members: { $in: [userId] } })
            .populate("members", "name email") // Populate member details
            .populate("lastMessage"); // Populate last message
        res.status(200).json(chats);
    }
    catch (error) {
        console.error("Error retrieving user chats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserChats = getUserChats;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, senderId, content } = req.body;
        // Check if chat exists
        const chat = yield Chat_1.Chat.findById(chatId);
        if (!chat)
            return res.status(404).json({ message: "Chat not found" });
        // Create and save the new message
        const newMessage = yield Message_1.Message.create({
            chatId,
            sender: senderId,
            content,
            readBy: [],
        });
        // Update chat with lastMessage reference
        chat.lastMessage = newMessage._id;
        yield chat.save();
        res.status(200).json({ message: "Message sent successfully", newMessage });
    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        // Retrieve messages sorted by createdAt DESC
        const messages = yield Message_1.Message.find({ chatId }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMessages = getMessages;
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { chatId } = req.params;
        // Find the chat
        const chat = yield Chat_1.Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }
        if (!((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield User_1.User.findById(req.user.id);
        if (((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.role) !== "Admin") {
            if (user === null || user === void 0 ? void 0 : user.chats.includes(new mongoose_1.default.Types.ObjectId(chatId))) {
                return res
                    .status(403)
                    .json({ success: false, message: "Unauthorized to delete this message" });
            }
        }
        // Delete all messages from the chat
        yield Message_1.Message.deleteMany({ chatId });
        // Remove the chat from users' chat lists
        yield User_1.User.updateMany({ _id: { $in: chat.members } }, { $pull: { chats: chatId } });
        // Finally, delete the chat
        yield Chat_1.Chat.findByIdAndDelete(chatId);
        return res.status(200).json({ success: true, message: "Chat deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting chat:", error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.deleteChat = deleteChat;
const readMessageUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, messageId } = req.params;
    const userId = req.body.userId; // User who is reading the message
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
        const message = yield Message_1.Message.findOneAndUpdate({ _id: messageId }, { $addToSet: { readBy: userId } }, { new: true });
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.status(200).json({ success: true, data: message });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.readMessageUpdate = readMessageUpdate;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { messageId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ success: false, message: "Invalid message ID" });
        }
        const message = yield Message_1.Message.findById(messageId);
        const senderId = message.senderId;
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role) !== "Admin") {
            if (((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id) !== senderId) {
                return res
                    .status(403)
                    .json({ success: false, message: "Unauthorized to delete this message" });
            }
        }
        yield Message_1.Message.findByIdAndDelete(messageId);
        res.status(200).json({ success: true, message: "Message deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteMessage = deleteMessage;
