import { Request, Response } from "express";
import { Schedule } from "../../models/Batch/Schedule";
import { Routine } from "../../models/Batch/Routine";
import { Batch } from "../../models/Batch/Batch";
import mongoose from "mongoose";

export const createSchedule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { batchId, subject, startTime, endTime, daysOfWeek, routineId, classroom, group } =
      req.body;

    const schedule: any = new Schedule({
      batchId,
      subject,
      startTime,
      endTime,
      daysOfWeek,
      routineId,
      classroom,
      group,
    });

    const batch = await Batch.findById(batchId);
    const routine = await Routine.findById(batch?.currentRoutineId);
    if (!batch || !routine) {
      return res.status(404).json({ success: false, message: "Batch or routine not found" });
    }
    routine.schedules.push(schedule._id);
    await schedule.save();
    await routine.save();
    res.status(201).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating schedule", error });
  }
};

// Get all schedules for a routine
export const getSchedulesForRoutine = async (req: Request, res: Response) => {
  try {
    const { routineId } = req.params;
    const schedules = await Schedule.find({ routineId: new mongoose.Types.ObjectId(routineId) });
    res.status(200).json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching schedules", error });
  }
};

// Get today's classes
export const getTodayClasses = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });

    const schedulesForToday = await Schedule.find({
      daysOfWeek: { $in: [dayOfWeek] }, // Check if today's day exists in the array
      isCancelled: false,
    });

    res.status(200).json({ success: true, schedules: schedulesForToday });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching today's classes", error });
  }
};

// Modify schedule (add, delete, reschedule, cancel)
export const modifySchedule = async (req: Request, res: Response): Promise<any> => {
  try {
    const { scheduleId } = req.params;
    const { action, updateData } = req.body;

    if (action === "add") {
      // Directly call the model to create a new schedule
      const result = await new Schedule().modifySchedule("add", updateData);
      return res.status(201).json(result);
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const result = await schedule.modifySchedule(action, updateData);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error modifying schedule", error });
  }
};

export const getTomorrowsClasses = async (req: Request, res: Response) => {
  try {
    // Get tomorrow's day name
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = tomorrow.toLocaleString("en-US", { weekday: "long" });

    // Find all schedules where tomorrow's day exists in `daysOfWeek`
    const schedulesForTomorrow = await Schedule.find({
      daysOfWeek: { $in: [dayOfWeek] },
      isCancelled: false,
    });

    res.status(200).json({ success: true, tomorrowClasses: schedulesForTomorrow });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tomorrow's classes", error });
  }
};
