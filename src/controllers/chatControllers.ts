import { Request, Response } from "express";
import Chat from "../models/Chat";
import  {Message} from "./../models/Message";

// Create a chat between two users
export const createChat = async (req: Request, res: Response): Promise<any> => {
  const { senderId, receiverId } = req.body;

  try {
    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) return res.status(200).json(existingChat);

    const newChat = new Chat({ members: [senderId, receiverId] });
    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error });
  }
};

// Get chats of a user
export const getUserChats = async (req: Request, res: Response): Promise<any> => {
  try {
    const chats = await Chat.find({ members: req.params.userId });
    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chats", error });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  const { chatId, senderId, text } = req.body;

  try {
    const message = new Message({ chatId, sender: senderId, text });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

// Get messages of a chat
export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};
