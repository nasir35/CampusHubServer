import { AuthReq } from "../../middlewares/authMiddleware";
import {Batch} from "./Batch";
import { ISchedule } from "./Routine";
import { Request, Response } from "express";

// **Get Today's Schedule**
export function getTodayClasses(this: any): ISchedule[] {
  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  const currentRoutine = this.routines.find((routine: any) => routine._id.toString() === this.currentRoutineId?.toString());

  if (!currentRoutine) return [];
  return currentRoutine.schedule.filter((cls: any) => cls.days.includes(today) && !cls.canceled);
}

// **Admin Controls: Cancel/Reschedule/Add/Delete**
export const modifyTodayScheduleController = async (req: AuthReq, res: Response):Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { batchId } = req.params;
    const { action, subjectData } = req.body as {
      action: "add" | "delete" | "reschedule" | "cancel";
      subjectData: Partial<ISchedule> & { newTime?: string };
    };

    if (!action || !subjectData) {
      return res.status(400).json({ success: false, message: "Action and subject Data are required" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Ensure the user is an admin
    const member = batch.membersList.find((m) => m.userId.toString() === req?.user?.id);
    if (!member || (member.role !== "admin" && member.role !== "moderator")) {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins or moderators can modify schedule" });
    }

    // Call the `modifyTodaySchedule` function
    const result = batch.modifyTodaySchedule(action, subjectData);
    await batch.save(); // Save the changes

    res.status(200).json({ success: result.success, message: result.message, data: batch });
  } catch (error) {
    console.error("Modify Schedule Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

