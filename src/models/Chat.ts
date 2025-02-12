import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  isGroup: boolean;
  name?: string;
  members: mongoose.Schema.Types.ObjectId[];
  lastMessage?: mongoose.Schema.Types.ObjectId; // Reference to the latest message
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
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Stores last sent message
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
