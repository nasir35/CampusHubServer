import mongoose, { Schema, Document, Types } from "mongoose";
import { IRoutine, ISchedule } from "./Routine";
import { modifyTodayScheduleController, getTodayClasses } from "./Schedule";
import { IMember } from "./Member";
import { IAnnouncement } from "./Announcement";
import { IResource } from "./Resources";
import crypto from "crypto";

// Function to generate an 8-character alphanumeric code
const generateUniqueCode = (): string => {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates 8-character unique string
};


// Define Batch Interface
export interface IBatch extends Document {
  name: string;
  code: string;
  institute: string;
  description?: string;
  createdBy: Types.ObjectId;
  batchType: "public" | "private";
  profilePic?: string;
  routines: IRoutine[];
  currentRoutineId: Types.ObjectId;
  upcomingClasses: ISchedule[];
  membersList: IMember[];
  announcements: IAnnouncement[];
  resources: IResource[];
  createdAt: Date;
  updatedAt: Date;
  getTodayClasses: () => ISchedule[];
  modifyTodaySchedule: (action: "add" | "delete" | "reschedule" | "cancel", subjectData: Partial<ISchedule> & { newTime?: string }) => { success: boolean; message: string };
}

// Define Schema
const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    institute: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batchType: { type: String, enum: ["public", "private"], default: "public" },
    profilePic: { type: String },

    // Relationships
    routines: [{ type: Schema.Types.ObjectId, ref: "Routine" }],
    currentRoutineId: { type: Schema.Types.ObjectId, ref: "Routine" },
    upcomingClasses: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    membersList: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    announcements: [{ type: Schema.Types.ObjectId, ref: "Announcement" }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
  },
  { timestamps: true }
);

// Attach Methods
BatchSchema.methods.getTodayClasses = getTodayClasses;
BatchSchema.methods.modifyTodaySchedule = modifyTodayScheduleController;

// Pre-save Hook for Unique Code
BatchSchema.pre("save", async function (next) {
  const batch = this as IBatch;
  while (await mongoose.models.Batch.findOne({ code: batch.code })) {
    batch.code = generateUniqueCode(); // Regenerate if not unique
  }
  next();
});

// Export Model
const Batch = mongoose.model<IBatch>("Batch", BatchSchema);
export default Batch;
