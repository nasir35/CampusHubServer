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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Schedule_1 = require("./Schedule");
const helper_1 = require("../../utils/helper");
// Define Schema
const BatchSchema = new mongoose_1.Schema({
    batchName: { type: String, required: true },
    batchCode: { type: String, required: true },
    institute: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    batchType: { type: String, enum: ["Public", "Private"], default: "Public" },
    batchPic: { type: String, default: "https://res.cloudinary.com/dax7yvopb/image/upload/v1739021465/group_d5hhyk.png" },
    // Relationships
    routines: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Routine" }],
    currentRoutineId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Routine" },
    upcomingClasses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Schedule" }],
    membersList: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Member" }],
    announcements: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Announcement" }],
    resources: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Resource" }],
}, { timestamps: true });
// Pre-save Hook for Unique Code
BatchSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const batch = this;
        if (!batch.batchCode) {
            batch.batchCode = (0, helper_1.generateUniqueCode)();
        }
        while (yield mongoose_1.default.models.Batch.findOne({ batchCode: batch.batchCode })) {
            batch.batchCode = (0, helper_1.generateUniqueCode)();
        }
        next();
    });
});
// Attach Methods
BatchSchema.methods.getTodayClasses = Schedule_1.getTodayClasses;
BatchSchema.methods.modifyTodaySchedule = Schedule_1.modifyTodayScheduleController;
// Export Model
exports.Batch = mongoose_1.default.model("Batch", BatchSchema);
