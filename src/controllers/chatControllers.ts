import { Request, Response } from "express";
import Chat from "../models/Chat";
import { Message } from "./../models/Message";
import { createNotification } from "./notificationController";
import asyncHandler from "../middlewares/asyncHandler";
import { IUser } from "../models/User";
import { ApiResponse } from "../types/response";

// Create a chat between two users
export const createChat = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  const { senderId, receiverId } = req.body;

  try {
    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) return res.status(200).json({ success: true, message: "Chat already exists", data: existingChat });

    const newChat = new Chat({ members: [senderId, receiverId] });
    await newChat.save();

    res.status(201).json({success: true, message: "Chat has been created", data: newChat});
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating chat", data : error });
  }
};

// Get chats of a user
export const getUserChats = async (req: Request, res: Response <ApiResponse>): Promise<any> => {
  try {
    const chats = await Chat.find({ members: req.params.userId });
    return res.status(200).json({success:true, message: "chat found", data: chats});
  } catch (error) {
    return res.status(500).json({success:false, message: "Error fetching chats" });
  }
};

// Send a message
// export const sendMessage = async (req: Request, res: Response): Promise<any> => {
//   const { chatId, senderId, text } = req.body;

//   try {
//     const message = new Message({ chatId, sender: senderId, text });
//     await message.save();

//     res.status(201).json(message);
//   } catch (error) {
//     res.status(500).json({ message: "Error sending message", error });
//   }
// };

// Send a message and store it inside the Chat document
export const sendMessage = asyncHandler(async (req: Request, res: Response<ApiResponse>):Promise<any> => {
  const {senderId, chatId, content } = req.body;

  // Find the chat and add the new message to the messages array
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({success:false, message: "Chat not found" });
  }

  const newMessage = {
    sender: senderId,
    content,
    createdAt: new Date(),
  };

  chat.messages.push(newMessage); // Store message inside Chat document
  await chat.save();

  // Notify chat participants (excluding the sender)
  chat.members.forEach(async (participant) => {
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

  res.status(201).json({ success: true, message: "message sent successfully", data: newMessage });
});



// Get messages of a chat
export const getMessages = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId });
    res.status(200).json({success: true, message: "message got successfully", data: messages});
  } catch (error) {
    res.status(500).json({success:false, message: "Error fetching messages" });
  }
};
