import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    profilePic: String,
    education: {
    institute: String,
    degree: String,
    session: String,
    grade: String
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    batch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
    role: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    default: "Student"
    },
    batchRole: {
    type: String,
    enum: ["Student", "Teacher", "Admin", "Coordinator"],
    default: "Student"
    },
    isOnline: {
    type: Boolean,
    default: false
    },
    createdAt: {
    type: Date,
    default: Date.now
    }
}, {
    timestamps: true
});

export const User = mongoose.model("User", UserSchema);
