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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Schedule_1 = require("./Schedule");
const crypto_1 = __importDefault(require("crypto"));
// Function to generate an 8-character alphanumeric code
const generateUniqueCode = () => {
    return crypto_1.default.randomBytes(4).toString("hex").toUpperCase(); // Generates 8-character unique string
};
// Define Schema
const BatchSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    institute: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    batchType: { type: String, enum: ["public", "private"], default: "public" },
    profilePic: { type: String },
    // Relationships
    routines: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Routine" }],
    currentRoutineId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Routine" },
    upcomingClasses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Schedule" }],
    membersList: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Member" }],
    announcements: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Announcement" }],
    resources: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Resource" }],
}, { timestamps: true });
// Attach Methods
BatchSchema.methods.getTodayClasses = Schedule_1.getTodayClasses;
BatchSchema.methods.modifyTodaySchedule = Schedule_1.modifyTodayScheduleController;
// Pre-save Hook for Unique Code
BatchSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const batch = this;
        while (yield mongoose_1.default.models.Batch.findOne({ code: batch.code })) {
            batch.code = generateUniqueCode(); // Regenerate if not unique
        }
        next();
    });
});
// Export Model
const Batch = mongoose_1.default.model("Batch", BatchSchema);
exports.default = Batch;
