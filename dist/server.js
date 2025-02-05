"use strict";
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
// WebSocket Setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allow all origins for testing, restrict in production
    },
});
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // User joins a chat room
    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });
    // Handle sending and receiving messages
    socket.on("send_message", (data) => {
        io.to(data.chatId).emit("receive_message", data);
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
