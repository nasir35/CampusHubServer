import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  chatId: mongoose.Schema.Types.ObjectId;
  readBy: mongoose.Schema.Types.ObjectId[]; // Track which users have read the message
  createdAt: Date;
  updatedAt: Date;
}

// Message schema definition
const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true } // This will auto-create `createdAt` and `updatedAt` fields
);

// Export the model
export const Message = mongoose.model<IMessage>("Message", MessageSchema);
