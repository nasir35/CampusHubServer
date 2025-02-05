"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    image: { type: String }, // URL to Cloudinary image
    likes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
            text: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
    batch: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Batch" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Post", postSchema);
