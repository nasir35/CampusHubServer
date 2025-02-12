import mongoose from "mongoose";
import { Request, Response } from "express";
import { ApiResponse } from "../types/response";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
import { findChatBetweenUsers } from "../utils/findChatBetweenUsers";
import { IMessage, Message } from "../models/Message";
import { AuthReq } from "../middlewares/authMiddleware";

export const createBinaryChat = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ success: false, message: "Both senderId and receiverId are required." });
  }

  try {
    // Check if a binary chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ success: true, message: "Chat already exists", data: existingChat });
    }

    // Create new binary chat
    const newChat = new Chat({ isGroup: false, members: [senderId, receiverId] });
    await newChat.save();

    // Add chat reference to both users
    await User.findByIdAndUpdate(senderId, { $push: { chats: newChat._id } });
    await User.findByIdAndUpdate(receiverId, { $push: { chats: newChat._id } });

    res.status(201).json({ success: true, message: "Binary Chat created", data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating chat", data: error });
  }
};

export const findChatId = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const { senderId, receiverId } = req.body;
    const existingChat = await findChatBetweenUsers(senderId, receiverId);

    if (!existingChat) {
      return res.status(404).json({ success: false, message: "Chat doesn't exists" });
    }
    return res
      .status(200)
      .json({ success: true, message: "ChatId found successfully.", data: existingChat._id });
  } catch (err) {
    return res.status(500).json({ success: false, message: "ChatId fetching error!" });
  }
};

export const getAllchats = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, message: `${chats.length} Chats founds.`, data: chats });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Chats fetching error!" });
  }
};

// Get chats of a user
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find all chats where the user is a member
    const chats = await Chat.find({ members: { $in: [userId] } })
      .populate("members", "name email") // Populate member details
      .populate("lastMessage"); // Populate last message

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error retrieving user chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId, senderId, content } = req.body;

    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Create and save the new message
    const newMessage: any = await Message.create({
      chatId,
      sender: senderId,
      content,
      readBy: [],
    });

    // Update chat with lastMessage reference
    chat.lastMessage = newMessage._id;
    await chat.save();

    res.status(200).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;

    // Retrieve messages sorted by createdAt DESC
    const messages = await Message.find({ chatId }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteChat = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    if (!req?.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user: any = await User.findById(req.user.id);

    if (req?.user?.role !== "Admin") {
      if (user?.chats.includes(new mongoose.Types.ObjectId(chatId))) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized to delete this message" });
      }
    }
    // Delete all messages from the chat
    await Message.deleteMany({ chatId });

    // Remove the chat from users' chat lists
    await User.updateMany({ _id: { $in: chat.members } }, { $pull: { chats: chatId } });

    // Finally, delete the chat
    await Chat.findByIdAndDelete(chatId);

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const readMessageUpdate = async (req: Request, res: Response): Promise<any> => {
  const { chatId, messageId } = req.params;
  const userId = req.body.userId; // User who is reading the message

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const message = await Message.findOneAndUpdate(
      { _id: messageId },
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMessage = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    }
    const message: any = await Message.findById(messageId);
    const senderId = message.senderId;
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    if (req?.user?.role !== "Admin") {
      if (req?.user?.id !== senderId) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized to delete this message" });
      }
    }
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
