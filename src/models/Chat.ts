import mongoose, { Schema, Document } from "mongoose";
import { Message } from "./Message";

interface IChat extends Document {
  members: mongoose.Schema.Types.ObjectId[]; // List of users in the chat
  createdAt: Date;
  updatedAt: Date;
}

// Chat schema definition
const ChatSchema = new Schema<IChat>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

// Optional method to get all messages for the chat (you can implement pagination if necessary)
ChatSchema.methods.getMessages = async function () {
  const messages = await Message.find({ chatId: this._id }).sort({ createdAt: 1 });
  return messages;
};

// Export the Chat model
export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
