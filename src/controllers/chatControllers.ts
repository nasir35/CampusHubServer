import { Request, Response } from "express";
import {Chat} from "../models/Chat";
import { createNotification } from "./notificationController";
import asyncHandler from "../middlewares/asyncHandler";
import { ApiResponse } from "../types/response";
import { User } from "../models/User";
import {findChatBetweenUsers} from "../utils/findChatBetweenUsers"
import mongoose from "mongoose";

export const createBinaryChat = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ success: false, message: "Both senderId and receiverId are required." });
  }

  try {
    // Check if a binary chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) {
      return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });
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

export const createBatchChat = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { name, creatorId } = req.body;

  if (!name || !creatorId) {
    return res.status(400).json({ success: false, message: "Group chat must have a name!" });
  }

  try {
    let members:any = [];
    // Add creator to the members list
    if (!members.includes(creatorId)) {
      members.push(creatorId);
    }

    // Create new group chat
    const newChat = new Chat({ isGroup: true, name, members });
    await newChat.save();

    // Add chat reference to all members
    await User.updateMany({ _id: { $in: members } }, { $push: { chats: newChat._id } });

    res.status(201).json({ success: true, message: "Group Chat created", data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating group chat", data: error });
  }
};



export const findChatId = async (req: Request, res: Response<ApiResponse>): Promise<any> => { 
  try {
    const { senderId, receiverId } = req.body;
     const existingChat = await findChatBetweenUsers(senderId, receiverId);

     if (!existingChat) {
       return res.status(404).json({ success: false, message: "Chat doesn't exists" });
    }
    return res.status(200).json({ success: true, message: "ChatId found successfully.", data: existingChat._id });
  }
  catch (err) {
    return res.status(500).json({ success: false, message: "ChatId fetching error!" });
  }
}

export const getAllchats = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: `${chats.length} Chats founds.`, data: chats });
  }
  catch (err) {
    return res.status(500).json({success:false, message: "Chats fetching error!"})
  }
}

// Get chats of a user
export const getUserChats = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const chats = await Chat.find({ members: req.params.userId });
    return res.status(200).json({ success: true, message: "Chats found", data: chats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching chats" });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) : Promise<any> => {
  const { chatId } = req.params;
  const { senderId, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
    return res.status(400).json({ error: "Invalid chatId or senderId" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Create the new message
    const newMessage = {
      sender: senderId,
      content: content,
      createdAt: new Date(),
      readBy: [senderId], // Message is automatically "read" by the sender
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getMessages = async (req: Request, res: Response) : Promise<any> => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ error: "Invalid chatId" });
  }

  try {
    const chat = await Chat.findById(chatId)
      .populate("messages.sender", "name email") // Populate sender details
      .populate("messages.readBy", "name email"); // Populate users who read the message

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Delete all messages from the chat
    await Chat.updateOne({ _id: chatId }, { $set: { messages: [] } });

    // Remove the chat from users' chat lists
    await User.updateMany(
      { _id: { $in: chat.members } },
      { $pull: { chats: chatId } }
    );

    // Finally, delete the chat
    await Chat.findByIdAndDelete(chatId);

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const readMessageUpdate = async (req: Request, res: Response) : Promise<any> => {
  const { chatId, messageId } = req.params;
  const userId = req.body.userId; // User who is reading the message

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, "messages._id": messageId },
      { $addToSet: { "messages.$.readBy": userId } }, // ✅ Only adds user if not already present
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat or message not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};