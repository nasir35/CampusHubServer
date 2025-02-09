import mongoose, { Schema, Document, Types } from "mongoose";
import { IRoutine, ISchedule } from "./Routine";
import { modifyTodayScheduleController, getTodayClasses } from "./Schedule";
import { IMember } from "./Member";
import { IAnnouncement } from "./Announcement";
import { IResource } from "./Resources";
import { generateUniqueCode } from "../../utils/helper";

// Define Batch Interface
export interface IBatch extends Document {
  batchName: string;
  batchCode: string;
  institute: string;
  description?: string;
  createdBy: Types.ObjectId;
  batchType: "Public" | "Private";
  batchPic?: string;
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
    batchName: { type: String, required: true },
    batchCode: { type: String, required: true},
    institute: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batchType: { type: String, enum: ["Public", "Private"], default: "Public" },
    batchPic: { type: String, default: "https://res.cloudinary.com/dax7yvopb/image/upload/v1739021465/group_d5hhyk.png" },

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

// Pre-save Hook for Unique Code
BatchSchema.pre("save", async function (next) {
  const batch = this as IBatch;
  if (!batch.batchCode) {
    batch.batchCode = generateUniqueCode();
  }
  while (await mongoose.models.Batch.findOne({ batchCode: batch.batchCode })) {
    batch.batchCode = generateUniqueCode();
  }
  next();
});

// Attach Methods
BatchSchema.methods.getTodayClasses = getTodayClasses;
BatchSchema.methods.modifyTodaySchedule = modifyTodayScheduleController;

// Export Model
export const Batch = mongoose.model<IBatch>("Batch", BatchSchema);
