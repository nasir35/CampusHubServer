"use strict";
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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    profilePic: { type: String, default: "https://res.cloudinary.com/dax7yvopb/image/upload/v1738953944/user_dwpdoy.png" },
    education: {
        institute: { type: String },
        degree: { type: String },
        session: { type: String },
        grade: { type: String },
    },
    posts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    chats: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Chat" }],
    batchChatId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat" },
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Notification" }],
    batch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Batch" },
    role: {
        type: String,
        enum: ["Student", "Teacher", "Admin"],
        default: "Student",
    },
    isOnline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.User = mongoose_1.default.model("User", UserSchema);
