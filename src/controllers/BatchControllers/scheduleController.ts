import { Request, Response } from "express";
import { Schedule } from "../../models/Batch/Schedule";

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { batch, subject, startTime, endTime, dayOfWeek, routineId, classroom, isBreak, group } =
      req.body;

    const schedule = new Schedule({
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

    await schedule.save();
    res.status(201).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating schedule", error });
  }
};

// Get all schedules for a routine
export const getSchedulesForRoutine = async (req: Request, res: Response) => {
  try {
    const { routineId } = req.params;
    const schedules = await Schedule.find({ routineId });
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
      dayOfWeek,
      isCancelled: false,
    });

    res.status(200).json({ success: true, schedules: schedulesForToday });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching today's classes", error });
  }
};

// Modify schedule (add, delete, reschedule, cancel)
export const modifySchedule = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const { action, newTime } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const result = await schedule.modifySchedule(action, { newTime });
    res.status(200).json({ success: result.success, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error modifying schedule", error });
  }
};
