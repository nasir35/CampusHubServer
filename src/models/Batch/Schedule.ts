import mongoose, { Schema, Document, Types } from "mongoose";

// Define Schedule Interface
export interface ISchedule extends Document {
  batchId: Types.ObjectId; // Reference to Batch
  subject: string; // Name of the subject
  startTime: Date; // Time when the class starts
  endTime: Date; // Time when the class ends
  daysOfWeek: string[]; // Day of the week (e.g., "Monday")
  routineId: Types.ObjectId; // Reference to Routine
  isCancelled: boolean; // Status of the class
  classroom: string;
  isBreak: boolean;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  getScheduleForBatch: (batchId: Types.ObjectId) => ISchedule[]; // Method to get schedules for a specific batch
  modifySchedule: (
    action: "add" | "delete" | "update" | "cancel",
    data: Partial<ISchedule> & { newTime?: string }
  ) => { success: boolean; message: string }; // Method to modify schedule
}

// Define Schema
const ScheduleSchema = new Schema<ISchedule>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    subject: { type: String, required: true },
    startTime: { type: Date }, // Changed from string to Date
    endTime: { type: Date }, // Changed from string to Date
    daysOfWeek: {
      type: [String],
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    isCancelled: { type: Boolean, default: false },
    classroom: { type: String, required: true }, // Added classroom field
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
  action: "add" | "delete" | "update" | "cancel",
  data: Partial<ISchedule>
) {
  const schedule = this as ISchedule;
  let responseMessage = "";
  let success = false;

  switch (action) {
    case "add":
      if (!data.batchId || !data.subject || !data.startTime || !data.endTime || !data.daysOfWeek) {
        return { success: false, message: "Missing required fields for adding a schedule." };
      }
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

    case "update":
      if (Object.keys(data).length === 0) {
        return { success: false, message: "No updates provided." };
      }
      Object.assign(schedule, data);
      await schedule.save();
      responseMessage = "Class updated successfully.";
      success = true;
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
