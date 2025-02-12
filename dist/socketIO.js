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
const socket_io_1 = require("socket.io");
const Chat_1 = require("./models/Chat"); // Assuming the model is at this location
const mongoose_1 = __importDefault(require("mongoose"));
const setupSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Allow all origins for testing, restrict in production
        },
    });
    global.io = io;
    io.on("connection", (socket) => {
        console.log("New user connected:", socket.id);
        // Join chat room
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
        });
        // Send & broadcast message
        socket.on("send_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ chatId, senderId, content, }) {
            try {
                const chat = yield Chat_1.Chat.findById(chatId);
                if (!chat) {
                    console.log(`Chat not found: ${chatId}`);
                    return;
                }
                const newMessage = {
                    sender: new mongoose_1.default.Types.ObjectId(senderId),
                    content,
                    createdAt: new Date(),
                    readBy: [],
                };
                chat.messages.push(newMessage);
                yield chat.save();
                io.to(chatId).emit("receive_message", newMessage); // Send message to all users in the chat room
            }
            catch (err) {
                console.error("Error sending message:", err);
            }
        }));
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
    return io;
};
exports.default = setupSocketIO;
