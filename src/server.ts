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

export default app;
