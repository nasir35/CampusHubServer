import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  readBy: mongoose.Schema.Types.ObjectId[]; // Array to track users who have seen the message
}

interface IChat extends Document {
  isGroup: boolean;
  name?: string;
  members: mongoose.Schema.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    isGroup: { type: Boolean, default: false },
    name: {
      type: String,
      required: function () {
        return this.isGroup;
      },
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Tracks seen users
      },
    ],
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
