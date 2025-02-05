import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

interface IChat extends Document {
  members: mongoose.Schema.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the chat
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
