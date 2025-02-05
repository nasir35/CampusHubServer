"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AnnouncementSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    date: Date,
    author: String || { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    image: String,
    category: String
}, {
    timestamps: true
});
exports.Announcement = mongoose_1.default.model('Announcement', AnnouncementSchema);
