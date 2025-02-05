import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema({
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        timestamp: Date
    }],
})

export const GroupChat = mongoose.model("GroupChat", GroupChatSchema);