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
exports.modifySchedule = exports.getTodaySchedule = exports.setActiveRoutine = void 0;
const Batch_1 = __importDefault(require("../../models/Batch/Batch"));
const mongoose_1 = require("mongoose");
// Set a new routine and make it active
const setActiveRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId, routineId } = req.params;
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch)
            return res.status(404).json({ success: false, message: "Batch not found" });
        if (!batch.routines.some((r) => r.toString() === routineId)) {
            return res.status(400).json({ success: false, message: "Routine does not belong to this batch" });
        }
        batch.currentRoutineId = new mongoose_1.Types.ObjectId(routineId);
        yield batch.save();
        res.json({ success: true, message: "Routine set as active" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.setActiveRoutine = setActiveRoutine;
// Fetch today's schedule
const getTodaySchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const batch = yield Batch_1.default.findById(batchId).populate("routines");
        if (!batch)
            return res.status(404).json({ success: false, message: "Batch not found" });
        const todayClasses = batch.getTodayClasses();
        res.json({ success: true, data: todayClasses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.getTodaySchedule = getTodaySchedule;
// Modify today's schedule (admin only)
const modifySchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const { action, subject, newTime } = req.body;
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch)
            return res.status(404).json({ success: false, message: "Batch not found" });
        const result = batch.modifyTodaySchedule(action, { subject, newTime });
        yield batch.save();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.modifySchedule = modifySchedule;
