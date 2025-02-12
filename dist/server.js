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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const connectDB_1 = __importDefault(require("./utils/connectDB"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const batchRoutes_1 = __importDefault(require("./routes/batchRoutes"));
const Message_1 = require("./models/Message");
dotenv_1.default.config();
(0, connectDB_1.default)();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // Create HTTP server for WebSockets
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("CampusHub Server is running!");
});
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use("/api/batches", batchRoutes_1.default);
// WebSocket Setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allow all origins for testing, restrict in production
    },
});
io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);
    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
    });
    socket.on("send_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ chatId, senderId, content }) {
        try {
            const newMessage = yield Message_1.Message.create({
                chatId,
                sender: senderId,
                content,
                readBy: [senderId],
            });
            // Emit message to all users in the chat room
            io.to(chatId).emit("receive_message", newMessage);
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
