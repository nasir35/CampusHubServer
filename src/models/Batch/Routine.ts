import mongoose, { Schema, Document, Types } from "mongoose";
import { ISchedule, Schedule } from "./Schedule";

// Define Routine Interface
export interface IRoutine extends Document {
  name: string; // The name of the routine (e.g., "Spring 2025 Routine")
  startDate: Date; // The start date of the routine
  endDate: Date; // The end date of the routine
  batchId: Types.ObjectId; // Reference to the Batch this routine belongs to
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
    endDate: { type: Date },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "archived", "completed"], default: "active" },
  },
  { timestamps: true }
);

// Method to get active schedules for this routine
RoutineSchema.methods.getActiveSchedules = async function () {
  return await Schedule.find({ routineId: this._id, isCancelled: false });
};

// Method to add a schedule
RoutineSchema.methods.addSchedule = async function (scheduleId: Types.ObjectId) {
  this.schedules.push(scheduleId);
  await this.save();
};

// Method to remove a schedule
RoutineSchema.methods.removeSchedule = async function (scheduleId: Types.ObjectId) {
  this.schedules = this.schedules.filter((id: any) => id.toString() !== scheduleId.toString());
  await this.save();
};

// Export Model
export const Routine = mongoose.model<IRoutine>("Routine", RoutineSchema);
