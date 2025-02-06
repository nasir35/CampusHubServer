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
const notificationController_1 = require("./notificationController");
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
// Create a chat between two users
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    try {
        const existingChat = yield Chat_1.default.findOne({
            members: { $all: [senderId, receiverId] },
        });
        if (existingChat)
            return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });
        const newChat = new Chat_1.default({ members: [senderId, receiverId] });
        yield newChat.save();
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
        const chats = yield Chat_1.default.find({ members: req.params.userId });
        return res.status(200).json({ success: true, message: "chat found", data: chats });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching chats" });
    }
});
exports.getUserChats = getUserChats;
// Send a message
// export const sendMessage = async (req: Request, res: Response): Promise<any> => {
//   const { chatId, senderId, text } = req.body;
//   try {
//     const message = new Message({ chatId, sender: senderId, text });
//     await message.save();
//     res.status(201).json(message);
//   } catch (error) {
//     res.status(500).json({ message: "Error sending message", error });
//   }
// };
// Send a message and store it inside the Chat document
exports.sendMessage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, chatId, content } = req.body;
    // Find the chat and add the new message to the messages array
    const chat = yield Chat_1.default.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }
    const newMessage = {
        sender: senderId,
        content,
        createdAt: new Date(),
    };
    chat.messages.push(newMessage); // Store message inside Chat document
    yield chat.save();
    // Notify chat participants (excluding the sender)
    chat.members.forEach((participant) => __awaiter(void 0, void 0, void 0, function* () {
        if (participant.toString() !== senderId.toString()) {
            yield (0, notificationController_1.createNotification)(participant.toString(), senderId, "New Message", "You have a new message.", `/chat/${chatId}` // Link to the chat
            );
        }
    }));
    res.status(201).json({ success: true, message: "message sent successfully", data: newMessage });
}));
// Get messages of a chat
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.Message.find({ chatId: req.params.chatId });
        res.status(200).json({ success: true, message: "message got successfully", data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
});
exports.getMessages = getMessages;
