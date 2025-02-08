import { Request, Response } from "express";
import {Chat} from "../models/Chat";
import { Message } from "../models/Message";
import { createNotification } from "./notificationController";
import asyncHandler from "../middlewares/asyncHandler";
import { ApiResponse } from "../types/response";
import { User } from "../models/User";

// Create a chat between two users
export const createChat = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if a chat between these users already exists
    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) {
      return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });
    }

    // Create new chat document
    const newChat = new Chat({ members: [senderId, receiverId] });
    await newChat.save();

    // Add chat reference to both users
    await User.findByIdAndUpdate(senderId, { $push: { chats: newChat._id } });
    await User.findByIdAndUpdate(receiverId, { $push: { chats: newChat._id } });

    res.status(201).json({ success: true, message: "Chat has been created", data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating chat", data: error });
  }
};


// Get chats of a user
export const getUserChats = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const chats = await Chat.find({ members: req.params.userId });
    return res.status(200).json({ success: true, message: "Chats found", data: chats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching chats" });
  }
};

// Send a message
export const sendMessage = asyncHandler(async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { senderId, chatId, content } = req.body;

  // Find the chat
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  // Create the new message
  const newMessage = new Message({
    sender: senderId,
    content,
    chatId: chat._id,
    readBy: [], // Initially no one has read the message
  });

  // Save the message in the Message collection
  await newMessage.save();

  // Notify chat participants (excluding the sender)
  chat.members.forEach(async (participant:any) => {
    if (participant.toString() !== senderId.toString()) {
      await createNotification(
        participant.toString(),
        senderId,
        "New Message",
        "You have a new message.",
        `/chat/${chatId}` // Link to the chat
      );
    }
  });

  res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
});


// Get messages of a chat
export const getMessages = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, message: "Messages fetched successfully", data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};
