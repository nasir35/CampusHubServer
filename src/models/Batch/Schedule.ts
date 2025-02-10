import mongoose, { Schema, Document, Types } from "mongoose";
import { IBatch } from "./Batch";
import { IRoutine } from "./Routine";

// Define Schedule Interface
export interface ISchedule extends Document {
  batch: Types.ObjectId; // Reference to Batch
  subject: string; // Name of the subject
  startTime: string; // Time when the class starts
  endTime: string; // Time when the class ends
  dayOfWeek: string; // Day of the week (e.g., "Monday")
  routineId: Types.ObjectId; // Reference to Routine
  isCancelled: boolean; // Status of the class
  createdAt: Date;
  updatedAt: Date;
  getScheduleForBatch: (batchId: Types.ObjectId) => ISchedule[]; // Method to get schedules for a specific batch
  modifySchedule: (action: "add" | "delete" | "reschedule" | "cancel", data: Partial<ISchedule> & { newTime?: string }) => { success: boolean; message: string }; // Method to modify schedule
}

// Define Schema
const ScheduleSchema = new Schema<ISchedule>(
  {
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Method to fetch all schedules for a specific batch
ScheduleSchema.methods.getScheduleForBatch = async function (batchId: Types.ObjectId) {
  return this.model("Schedule").find({ batch: batchId, isCancelled: false });
};

// Method to modify schedule (add, delete, reschedule, or cancel)
ScheduleSchema.methods.modifySchedule = async function (action: "add" | "delete" | "reschedule" | "cancel", data: Partial<ISchedule> & { newTime?: string }) {
  const schedule = this as ISchedule;
  let responseMessage = "";
  let success = false;

  switch (action) {
    case "add":
      const newSchedule = new (this.model("Schedule") as mongoose.Model<ISchedule>)(data);
      await newSchedule.save();
      responseMessage = "Class added successfully.";
      success = true;
      break;

    case "delete":
      await this.model("Schedule").deleteOne({ _id: schedule._id });
      responseMessage = "Class deleted successfully.";
      success = true;
      break;

    case "reschedule":
      if (data.newTime) {
        schedule.startTime = data.newTime;
        await schedule.save();
        responseMessage = "Class rescheduled successfully.";
        success = true;
      } else {
        responseMessage = "New time is required for rescheduling.";
      }
      break;

    case "cancel":
      schedule.isCancelled = true;
      await schedule.save();
      responseMessage = "Class cancelled successfully.";
      success = true;
      break;

    default:
      responseMessage = "Invalid action.";
  }

  return { success, message: responseMessage };
};

// Function to get today's classes
export const getTodayClasses = async function (this: ISchedule) {
  const today = new Date();
  const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" }); // Get current weekday (e.g., "Monday")

  const schedulesForToday = await this.model("Schedule")
    .find({
      batch: this.batch,
      dayOfWeek,
      isCancelled: false,
    })
    .populate("routineId"); // Assuming routineId is important to populate here.

  return schedulesForToday;
};

// Function to modify today's schedule (add, delete, reschedule, cancel)
export const modifyTodayScheduleController = async function (
  this: ISchedule,
  action: "add" | "delete" | "reschedule" | "cancel",
  subjectData: Partial<ISchedule> & { newTime?: string }
):Promise<any> {
  const schedule = this as ISchedule;
  let responseMessage = "";
  let success = false;

  const today = new Date();
  const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });

  switch (action) {
    case "add":
      const newSchedule = new (this.model("Schedule") as mongoose.Model<ISchedule>)({
        ...subjectData,
        dayOfWeek: dayOfWeek,
        batch: schedule.batch,
      });
      await newSchedule.save();
      responseMessage = "Class added successfully.";
      success = true;
      break;

    case "delete":
      await this.model("Schedule").deleteOne({ _id: schedule._id, dayOfWeek: dayOfWeek });
      responseMessage = "Class deleted successfully.";
      success = true;
      break;

    case "reschedule":
      if (subjectData.newTime) {
        schedule.startTime = subjectData.newTime;
        await schedule.save();
        responseMessage = "Class rescheduled successfully.";
        success = true;
      } else {
        responseMessage = "New time is required for rescheduling.";
      }
      break;

    case "cancel":
      schedule.isCancelled = true;
      await schedule.save();
      responseMessage = "Class cancelled successfully.";
      success = true;
      break;

    default:
      responseMessage = "Invalid action.";
  }

  return { success, message: responseMessage };
};

// Export Model
export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
