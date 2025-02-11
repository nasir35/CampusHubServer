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
exports.archiveRoutine = exports.getRoutinesForBatch = exports.createRoutine = void 0;
const Routine_1 = require("../../models/Batch/Routine");
const Batch_1 = require("../../models/Batch/Batch");
const createRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, startDate, endDate, batchId, createdBy, status } = req.body;
        startDate = startDate ? startDate : new Date(Date.now());
        status = status ? status : "active";
        const routine = new Routine_1.Routine({
            name,
            startDate,
            endDate,
            batchId,
            createdBy,
            status,
        });
        yield routine.save();
        yield Batch_1.Batch.findByIdAndUpdate(batchId, {
            $set: { currentRoutineId: routine._id },
        }, { new: true, runValidators: true });
        yield Routine_1.Routine.updateMany({ _id: { $ne: routine._id } }, // Find all routines except the current one
        { $set: { status: "archived" } } // Update status to archived
        );
        res.status(201).json({ success: true, routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating routine", error });
    }
});
exports.createRoutine = createRoutine;
// Get all routines for a batch
const getRoutinesForBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const routines = yield Routine_1.Routine.find({ batchId });
        res.status(200).json({ success: true, routines });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching routines", error });
    }
});
exports.getRoutinesForBatch = getRoutinesForBatch;
// update a routine status
const archiveRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId } = req.params;
        let updatedStatus = req.body.status || "archived";
        const routine = yield Routine_1.Routine.findByIdAndUpdate(routineId, { status: updatedStatus }, { new: true });
        res.status(200).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error archiving routine", error });
    }
});
exports.archiveRoutine = archiveRoutine;
