import { Request, Response } from "express";
import { AuthReq } from "../../middlewares/authMiddleware";
import Batch from "../../models/Batch/Batch";
import { Types } from "mongoose";

// Set a new routine and make it active
export const setActiveRoutine = async (req: AuthReq, res: Response) => {
  try {
    const { batchId, routineId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    if (!batch.routines.some((r) => r.toString() === routineId)) {
      return res.status(400).json({ success: false, message: "Routine does not belong to this batch" });
    }

    batch.currentRoutineId = new Types.ObjectId(routineId);
    await batch.save();

    res.json({ success: true, message: "Routine set as active" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Fetch today's schedule
export const getTodaySchedule = async (req: AuthReq, res: Response) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId).populate("routines");

    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    const todayClasses = batch.getTodayClasses();
    res.json({ success: true, data: todayClasses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Modify today's schedule (admin only)
export const modifySchedule = async (req: AuthReq, res: Response) => {
  try {
    const { batchId } = req.params;
    const { action, subject, newTime } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    const result = batch.modifyTodaySchedule(action, { subject, newTime });
    await batch.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
