"use strict";
// import mongoose, { Schema, Document } from "mongoose";
// import { Message } from "./Message";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
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
const mongoose_1 = __importStar(require("mongoose"));
const ChatSchema = new mongoose_1.Schema({
    isGroup: { type: Boolean, default: false }, // Default is a binary chat
    name: {
        type: String,
        required: function () {
            return this.isGroup;
        },
    }, // Name required only for groups
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true }], // Users in the chat
    messages: [
        {
            sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
exports.Chat = mongoose_1.default.model("Chat", ChatSchema);
