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
exports.Schedule = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define Schema
const ScheduleSchema = new mongoose_1.Schema({
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Batch", required: true },
    subject: { type: String, required: true },
    startTime: { type: Date }, // Changed from string to Date
    endTime: { type: Date }, // Changed from string to Date
    daysOfWeek: {
        type: [String],
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        required: true,
    },
    routineId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Routine", required: true },
    isCancelled: { type: Boolean, default: false },
    classroom: { type: String, required: true }, // Added classroom field
    group: { type: String, default: null }, // Added group support
}, { timestamps: true });
// Fetch all schedules for a batch
ScheduleSchema.methods.getScheduleForBatch = function (batchId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.model("Schedule").find({ batch: batchId, isCancelled: false });
    });
};
// Modify schedule (add, delete, reschedule, cancel)
ScheduleSchema.methods.modifySchedule = function (action, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const schedule = this;
        let responseMessage = "";
        let success = false;
        switch (action) {
            case "add":
                const newSchedule = new (this.model("Schedule"))(data);
                yield newSchedule.save();
                responseMessage = "Class added successfully.";
                success = true;
                break;
            case "delete":
                yield this.model("Schedule").deleteOne({ _id: schedule._id });
                responseMessage = "Class deleted successfully.";
                success = true;
                break;
            case "reschedule":
                if (data.newTime) {
                    schedule.startTime = data.newTime;
                    yield schedule.save();
                    responseMessage = "Class rescheduled successfully.";
                    success = true;
                }
                else {
                    responseMessage = "New time is required for rescheduling.";
                }
                break;
            case "cancel":
                schedule.isCancelled = true;
                yield schedule.save();
                responseMessage = "Class cancelled successfully.";
                success = true;
                break;
            default:
                responseMessage = "Invalid action.";
        }
        return { success, message: responseMessage };
    });
};
// Export Model
exports.Schedule = mongoose_1.default.model("Schedule", ScheduleSchema);
