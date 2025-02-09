"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Function to generate an 8-character alphanumeric code
const generateUniqueCode = () => {
    return crypto_1.default.randomBytes(4).toString("hex").toUpperCase(); // Generates 8-character unique string
};
exports.generateUniqueCode = generateUniqueCode;
