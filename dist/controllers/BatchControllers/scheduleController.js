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
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifySchedule = exports.getTodayClasses = exports.getSchedulesForRoutine = exports.createSchedule = void 0;
const Schedule_1 = require("../../models/Batch/Schedule");
const createSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batch, subject, startTime, endTime, dayOfWeek, routineId, classroom, isBreak, group } = req.body;
        const schedule = new Schedule_1.Schedule({
            batch,
            subject,
            startTime,
            endTime,
            dayOfWeek,
            routineId,
            classroom,
            isBreak,
            group,
        });
        yield schedule.save();
        res.status(201).json({ success: true, schedule });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating schedule", error });
    }
});
exports.createSchedule = createSchedule;
// Get all schedules for a routine
const getSchedulesForRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId } = req.params;
        const schedules = yield Schedule_1.Schedule.find({ routineId });
        res.status(200).json({ success: true, schedules });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching schedules", error });
    }
});
exports.getSchedulesForRoutine = getSchedulesForRoutine;
// Get today's classes
const getTodayClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });
        const schedulesForToday = yield Schedule_1.Schedule.find({
            dayOfWeek,
            isCancelled: false,
        });
        res.status(200).json({ success: true, schedules: schedulesForToday });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching today's classes", error });
    }
});
exports.getTodayClasses = getTodayClasses;
// Modify schedule (add, delete, reschedule, cancel)
const modifySchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { scheduleId } = req.params;
        const { action, newTime } = req.body;
        const schedule = yield Schedule_1.Schedule.findById(scheduleId);
        if (!schedule)
            return res.status(404).json({ success: false, message: "Schedule not found" });
        const result = yield schedule.modifySchedule(action, { newTime });
        res.status(200).json({ success: result.success, message: result.message });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error modifying schedule", error });
    }
});
exports.modifySchedule = modifySchedule;
