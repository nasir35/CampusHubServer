"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
    Actor: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    type: String,
    message: String,
    link: String,
    seen: { type: Boolean, default: false }
}, {
    timestamps: true,
});
exports.Notification = mongoose_1.default.model("Notification", NotificationSchema);
