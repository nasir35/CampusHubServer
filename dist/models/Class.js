"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ClassSchema = new mongoose_1.default.Schema({
    name: String,
    description: String,
    cover: String,
    code: String,
    teacher: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    time: String,
    weekDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
});
exports.default = mongoose_1.default.model('Class', ClassSchema);
