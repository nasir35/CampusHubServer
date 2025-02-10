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
exports.Routine = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define Schema
const RoutineSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    batch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Batch", required: true },
    schedules: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Schedule" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "archived", "completed"], default: "active" },
}, { timestamps: true });
// Method to get active schedules for this routine
RoutineSchema.methods.getActiveSchedules = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const routine = this;
        return yield mongoose_1.default.model("Schedule").find({ routineId: routine._id, isCancelled: false });
    });
};
// Method to add a schedule to this routine
RoutineSchema.methods.addSchedule = function (scheduleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const routine = this;
        if (!routine.schedules.includes(scheduleId)) {
            routine.schedules.push(scheduleId);
            yield routine.save();
            return { success: true, message: "Schedule added to routine." };
        }
        else {
            return { success: false, message: "Schedule already exists in routine." };
        }
    });
};
// Method to remove a schedule from this routine
RoutineSchema.methods.removeSchedule = function (scheduleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const routine = this;
        const index = routine.schedules.indexOf(scheduleId);
        if (index > -1) {
            routine.schedules.splice(index, 1);
            yield routine.save();
            return { success: true, message: "Schedule removed from routine." };
        }
        else {
            return { success: false, message: "Schedule not found in routine." };
        }
    });
};
// Export Model
exports.Routine = mongoose_1.default.model("Routine", RoutineSchema);
