import mongoose, { Schema, Document } from "mongoose";

// Define Schedule Interface
export interface ISchedule {
  days: string[]; // e.g., ["Monday", "Wednesday"]
  time: string; // e.g., "10:00 AM - 12:00 PM"
  subject: string;
  instructor?: string;
  canceled?: boolean;
}

// Define Routine Interface
export interface IRoutine extends Document {
  title: string;
  schedule: ISchedule[];
  createdAt: Date;
}

// Routine Schema
const RoutineSchema = new Schema<IRoutine>(
  {
    title: { type: String, required: true },
    schedule: [
      {
        days: [{ type: String, required: true }],
        time: { type: String, required: true },
        subject: { type: String, required: true },
        instructor: { type: String },
        canceled: { type: Boolean, default: false },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Routine = mongoose.model<IRoutine>("Routine", RoutineSchema);
export default Routine;
