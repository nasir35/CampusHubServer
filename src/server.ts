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
import { Message } from "./models/Message";

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
    origin: "*", // Allow all origins (update in production)
    methods: ["GET", "POST"],
  },
  transports: ["polling"], // Force polling instead of WebSockets
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", async ({ chatId, senderId, content }) => {
    try {
      const newMessage = await Message.create({
        chatId,
        sender: senderId,
        content,
        readBy: [senderId],
      });

      // Emit message to all users in the chat room
      io.to(chatId).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
