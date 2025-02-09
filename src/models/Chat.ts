// import mongoose, { Schema, Document } from "mongoose";
// import { Message } from "./Message";

// interface IChat extends Document {
//   members: mongoose.Schema.Types.ObjectId[]; // List of users in the chat
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Chat schema definition
// const ChatSchema = new Schema<IChat>(
//   {
//     members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//   },
//   { timestamps: true }
// );

// // Optional method to get all messages for the chat (you can implement pagination if necessary)
// ChatSchema.methods.getMessages = async function () {
//   const messages = await Message.find({ chatId: this._id }).sort({ createdAt: 1 });
//   return messages;
// };

// // Export the Chat model
// export const Chat = mongoose.model<IChat>("Chat", ChatSchema);


import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

interface IChat extends Document {
  isGroup: boolean; // true = Group Chat, false = Binary Chat
  name?: string; // Only needed for group chats
  members: mongoose.Schema.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    isGroup: { type: Boolean, default: false }, // Default is a binary chat
    name: {
      type: String,
      required: function () {
        return this.isGroup;
      },
    }, // Name required only for groups
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // Users in the chat
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

export const Chat =  mongoose.model<IChat>("Chat", ChatSchema);

