import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    Actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: String,
    message: String,
    link : String,
    seen: { type: Boolean, default: false }
}, {
    timestamps: true,
})

export const Notification = mongoose.model("Notification", NotificationSchema);