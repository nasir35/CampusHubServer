import mongoose from "mongoose";

export interface IRoutine {
  _id?: mongoose.Types.ObjectId;
  title: string;
  schedule: {
    days: string[]; // e.g., ["Monday", "Wednesday"]
    time: string; // e.g., "10:00 AM - 12:00 PM"
    subject: string;
    instructor?: string;
  }[];
  createdAt: Date;
}

const RoutineSchema = new mongoose.Schema<IRoutine>({
  title: { type: String, required: true },
  schedule: [
    {
      days: [{ type: String, required: true }], // Multiple days support
      time: { type: String, required: true },
      subject: { type: String, required: true },
      instructor: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRoutine>("Routine", RoutineSchema);