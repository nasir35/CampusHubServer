"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BatchSchema = new mongoose_1.default.Schema({
    batch: String,
    session: String,
    department: String,
    thumbnail: String,
    title: String,
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
});
exports.Batch = mongoose_1.default.model("Batch", BatchSchema);
