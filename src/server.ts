import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/connectDB";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import postRoutes from "./routes/postRoutes";
import batchRoutes from "./routes/batchRoutes";
import { Chat } from "./models/Chat";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server for WebSockets

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CampusHub Server is running!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/batches", batchRoutes);

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing, restrict in production
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Join chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  // Send & broadcast message
  socket.on("send_message", async ({ chatId, senderId, content }) => {
    const chat = await Chat.findById(chatId);
    if (!chat) return;

    const newMessage = { sender: senderId, content, createdAt: new Date(), readBy: [] };
    chat.messages.push(newMessage);
    await chat.save();

    io.to(chatId).emit("receive_message", newMessage); // Send message to all users in the chat room
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
