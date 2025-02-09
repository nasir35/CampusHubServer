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
exports.getMessages = exports.sendMessage = exports.getUserChats = exports.getAllchats = exports.findChatId = exports.createBatchChat = exports.createBinaryChat = void 0;
const Chat_1 = require("../models/Chat");
const Message_1 = require("../models/Message");
const notificationController_1 = require("./notificationController");
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const User_1 = require("../models/User");
const findChatBetweenUsers_1 = require("../utils/findChatBetweenUsers");
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
