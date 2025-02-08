"use strict";
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
exports.modifyTodayScheduleController = void 0;
exports.getTodayClasses = getTodayClasses;
const Batch_1 = __importDefault(require("./Batch"));
// **Get Today's Schedule**
function getTodayClasses() {
    const today = new Date().toLocaleString("en-US", { weekday: "long" });
    const currentRoutine = this.routines.find((routine) => { var _a; return routine._id.toString() === ((_a = this.currentRoutineId) === null || _a === void 0 ? void 0 : _a.toString()); });
    if (!currentRoutine)
        return [];
    return currentRoutine.schedule.filter((cls) => cls.days.includes(today) && !cls.canceled);
}
// **Admin Controls: Cancel/Reschedule/Add/Delete**
const modifyTodayScheduleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { batchId } = req.params;
        const { action, subjectData } = req.body;
        if (!action || !subjectData) {
            return res.status(400).json({ success: false, message: "Action and subjectData are required" });
        }
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        // Ensure the user is an admin
        const member = batch.membersList.find((m) => { var _a; return m.userId.toString() === ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (!member || (member.role !== "admin" && member.role !== "moderator")) {
            return res.status(403).json({ success: false, message: "Forbidden: Only admins or moderators can modify schedule" });
        }
        // Call the `modifyTodaySchedule` function
        const result = batch.modifyTodaySchedule(action, subjectData);
        yield batch.save(); // Save the changes
        res.status(200).json({ success: result.success, message: result.message, data: batch });
    }
    catch (error) {
        console.error("Modify Schedule Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.modifyTodayScheduleController = modifyTodayScheduleController;
