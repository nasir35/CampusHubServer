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
const createRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, startDate, endDate, batchId, createdBy } = req.body;
        const routine = new Routine_1.Routine({
            name,
            startDate,
            endDate,
            batchId,
            createdBy,
        });
        yield routine.save();
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
// Archive a routine
const archiveRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId } = req.params;
        const routine = yield Routine_1.Routine.findByIdAndUpdate(routineId, { status: "archived" }, { new: true });
        res.status(200).json({ success: true, routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error archiving routine", error });
    }
});
exports.archiveRoutine = archiveRoutine;
