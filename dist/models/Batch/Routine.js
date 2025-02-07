"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RoutineSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    schedule: [
        {
            days: [{ type: String, required: true }], // Multiple days support
            time: { type: String, required: true },
            subject: { type: String, required: true },
            instructor: { type: String },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model("Routine", RoutineSchema);
