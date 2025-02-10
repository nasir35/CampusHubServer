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
exports.readMessageUpdate = exports.deleteChat = exports.getMessages = exports.sendMessage = exports.getUserChats = exports.getAllchats = exports.findChatId = exports.createBatchChat = exports.createBinaryChat = void 0;
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const findChatBetweenUsers_1 = require("../utils/findChatBetweenUsers");
const mongoose_1 = __importDefault(require("mongoose"));
const createBinaryChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).json({ success: false, message: "Both senderId and receiverId are required." });
    }
    try {
        // Check if a binary chat already exists
        const existingChat = yield Chat_1.Chat.findOne({
            isGroup: false,
            members: { $all: [senderId, receiverId] },
        });
        if (existingChat) {
            return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });
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
const createBatchChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, creatorId } = req.body;
    if (!name || !creatorId) {
        return res.status(400).json({ success: false, message: "Group chat must have a name!" });
    }
    try {
        let members = [];
        // Add creator to the members list
        if (!members.includes(creatorId)) {
            members.push(creatorId);
        }
        // Create new group chat
        const newChat = new Chat_1.Chat({ isGroup: true, name, members });
        yield newChat.save();
        // Add chat reference to all members
        yield User_1.User.updateMany({ _id: { $in: members } }, { $push: { chats: newChat._id } });
        res.status(201).json({ success: true, message: "Group Chat created", data: newChat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating group chat", data: error });
    }
});
exports.createBatchChat = createBatchChat;
const findChatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId } = req.body;
        const existingChat = yield (0, findChatBetweenUsers_1.findChatBetweenUsers)(senderId, receiverId);
        if (!existingChat) {
            return res.status(404).json({ success: false, message: "Chat doesn't exists" });
        }
        return res.status(200).json({ success: true, message: "ChatId found successfully.", data: existingChat._id });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "ChatId fetching error!" });
    }
});
exports.findChatId = findChatId;
const getAllchats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield Chat_1.Chat.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: `${chats.length} Chats founds.`, data: chats });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Chats fetching error!" });
    }
});
exports.getAllchats = getAllchats;
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
// Send a new message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const { senderId, content } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(chatId) || !mongoose_1.default.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json({ error: "Invalid chatId or senderId" });
    }
    try {
        const chat = yield Chat_1.Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        // Create the new message
        const newMessage = {
            sender: senderId,
            content: content,
            createdAt: new Date(),
            readBy: [senderId], // Message is automatically "read" by the sender
        };
        chat.messages.push(newMessage);
        yield chat.save();
        res.status(201).json({ success: true, message: newMessage });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chatId" });
    }
    try {
        const chat = yield Chat_1.Chat.findById(chatId)
            .populate("messages.sender", "name email") // Populate sender details
            .populate("messages.readBy", "name email"); // Populate users who read the message
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.status(200).json({ success: true, messages: chat.messages });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getMessages = getMessages;
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        // Find the chat
        const chat = yield Chat_1.Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }
        // Delete all messages from the chat
        yield Chat_1.Chat.updateOne({ _id: chatId }, { $set: { messages: [] } });
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
        const chat = yield Chat_1.Chat.findOneAndUpdate({ _id: chatId, "messages._id": messageId }, { $addToSet: { "messages.$.readBy": userId } }, // ✅ Only adds user if not already present
        { new: true });
        if (!chat) {
            return res.status(404).json({ error: "Chat or message not found" });
        }
        res.status(200).json({ success: true, chat });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.readMessageUpdate = readMessageUpdate;
