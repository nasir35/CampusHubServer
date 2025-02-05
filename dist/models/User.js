"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
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
    posts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post" }],
    chats: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat" }],
    followers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Notification" }],
    batch: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Batch" }],
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
exports.User = mongoose_1.default.model("User", UserSchema);
