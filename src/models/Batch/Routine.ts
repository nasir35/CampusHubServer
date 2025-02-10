import mongoose, { Schema, Document, Types } from "mongoose";
import { ISchedule } from "./Schedule";

// Define Routine Interface
export interface IRoutine extends Document {
  name: string; // The name of the routine (e.g., "Spring 2025 Routine")
  startDate: Date; // The start date of the routine
  endDate: Date; // The end date of the routine
  batch: Types.ObjectId; // Reference to the Batch this routine belongs to
  schedules: Types.ObjectId[]; // Reference to the Schedules for this routine
  createdBy: Types.ObjectId; // The user who created the routine
  status: "active" | "archived" | "completed"; // Status of the routine
  createdAt: Date;
  updatedAt: Date;
  getActiveSchedules: () => ISchedule[]; // Method to get active schedules for this routine
  addSchedule: (scheduleId: Types.ObjectId) => void; // Method to add a new schedule to this routine
  removeSchedule: (scheduleId: Types.ObjectId) => void; // Method to remove a schedule from this routine
}

// Define Schema
const RoutineSchema = new Schema<IRoutine>(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "archived", "completed"], default: "active" },
  },
  { timestamps: true }
);

// Method to get active schedules for this routine
RoutineSchema.methods.getActiveSchedules = async function () {
  const routine = this as IRoutine;
  return await mongoose.model("Schedule").find({ routineId: routine._id, isCancelled: false });
};

// Method to add a schedule to this routine
RoutineSchema.methods.addSchedule = async function (scheduleId: Types.ObjectId) {
  const routine = this as IRoutine;
  if (!routine.schedules.includes(scheduleId)) {
    routine.schedules.push(scheduleId);
    await routine.save();
    return { success: true, message: "Schedule added to routine." };
  } else {
    return { success: false, message: "Schedule already exists in routine." };
  }
};

// Method to remove a schedule from this routine
RoutineSchema.methods.removeSchedule = async function (scheduleId: Types.ObjectId) {
  const routine = this as IRoutine;
  const index = routine.schedules.indexOf(scheduleId);
  if (index > -1) {
    routine.schedules.splice(index, 1);
    await routine.save();
    return { success: true, message: "Schedule removed from routine." };
  } else {
    return { success: false, message: "Schedule not found in routine." };
  }
};

// Export Model
export const Routine = mongoose.model<IRoutine>("Routine", RoutineSchema);
