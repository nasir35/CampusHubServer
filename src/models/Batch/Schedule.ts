import mongoose, { Schema, Document, Types } from "mongoose";

// Define Schedule Interface
export interface ISchedule extends Document {
  batch: Types.ObjectId; // Reference to Batch
  subject: string; // Name of the subject
  startTime: Date; // Time when the class starts
  endTime: Date; // Time when the class ends
  dayOfWeek: string; // Day of the week (e.g., "Monday")
  routineId: Types.ObjectId; // Reference to Routine
  isCancelled: boolean; // Status of the class
  classroom: string;
  isBreak: boolean;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  getScheduleForBatch: (batchId: Types.ObjectId) => ISchedule[]; // Method to get schedules for a specific batch
  modifySchedule: (
    action: "add" | "delete" | "reschedule" | "cancel",
    data: Partial<ISchedule> & { newTime?: string }
  ) => { success: boolean; message: string }; // Method to modify schedule
}

// Define Schema
const ScheduleSchema = new Schema<ISchedule>(
  {
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    subject: { type: String, required: true },
    startTime: { type: Date, required: true }, // Changed from string to Date
    endTime: { type: Date, required: true }, // Changed from string to Date
    dayOfWeek: {
      type: String,
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    isCancelled: { type: Boolean, default: false },
    classroom: { type: String, required: true }, // Added classroom field
    isBreak: { type: Boolean, default: false }, // Added break support
    group: { type: String, default: null }, // Added group support
  },
  { timestamps: true }
);

// Fetch all schedules for a batch
ScheduleSchema.methods.getScheduleForBatch = async function (batchId: Types.ObjectId) {
  return await this.model("Schedule").find({ batch: batchId, isCancelled: false });
};

// Modify schedule (add, delete, reschedule, cancel)
ScheduleSchema.methods.modifySchedule = async function (
  action: "add" | "delete" | "reschedule" | "cancel",
  data: Partial<ISchedule> & { newTime?: Date }
) {
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

// Export Model
export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
