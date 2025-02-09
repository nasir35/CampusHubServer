import { Request, Response } from "express";
import {Chat} from "../models/Chat";
import { Message } from "../models/Message";
import { createNotification } from "./notificationController";
import asyncHandler from "../middlewares/asyncHandler";
import { ApiResponse } from "../types/response";
import { User } from "../models/User";
import {findChatBetweenUsers} from "../utils/findChatBetweenUsers"

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
