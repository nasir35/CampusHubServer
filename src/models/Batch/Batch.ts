import mongoose, { Schema, Document, Types } from "mongoose";
import { IRoutine } from "./Routine";
import { ISchedule } from "./Schedule";
import { IAnnouncement } from "./Announcement";
import { IResource } from "./Resources";
import { generateUniqueCode } from "../../utils/helper";
import {
  getTodayClasses,
  modifySchedule,
} from "../../controllers/BatchControllers/scheduleController";

interface memberListType {
  userId: Types.ObjectId;
  memberId: Types.ObjectId;
}
// Define Batch Interface
export interface IBatch extends Document {
  batchName: string;
  batchCode: string;
  institute: string;
  description?: string;
  createdBy: Types.ObjectId;
  batchType: "Public" | "Private";
  batchPic?: string;
  chatId: Types.ObjectId;
  currentRoutineId: Types.ObjectId;
  upcomingClasses: ISchedule[];
  membersList: memberListType[];
  announcements: IAnnouncement[];
  resources: IResource[];
  createdAt: Date;
  updatedAt: Date;
  getTodayClasses: () => ISchedule[];
  modifyTodaySchedule: (
    action: "add" | "delete" | "reschedule" | "cancel",
    subjectData: Partial<ISchedule> & { newTime?: string }
  ) => { success: boolean; message: string };
}

// Define Schema
const BatchSchema = new Schema<IBatch>(
  {
    batchName: { type: String, required: true },
    batchCode: { type: String, required: true, unique: [true, "Batch code is required."] },
    institute: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batchType: { type: String, enum: ["Public", "Private"], default: "Public" },
    batchPic: {
      type: String,
      default: "https://res.cloudinary.com/dax7yvopb/image/upload/v1739021465/group_d5hhyk.png",
    },

    // Relationships
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    currentRoutineId: { type: Schema.Types.ObjectId, ref: "Routine" },
    upcomingClasses: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    membersList: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
      },
    ],
    announcements: [{ type: Schema.Types.ObjectId, ref: "Announcement" }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
  },
  { timestamps: true }
);

BatchSchema.pre("save", async function (next) {
  const batch = this as IBatch;

  // Only generate a batchCode if it is missing
  if (!batch.batchCode) {
    let isUnique = false;
    let newCode = "";

    // Try generating a unique batchCode
    while (!isUnique) {
      newCode = generateUniqueCode();
      const existingBatch = await mongoose.models.Batch.exists({ batchCode: newCode });

      if (!existingBatch) {
        isUnique = true;
      }
    }

    batch.batchCode = newCode;
  }

  next();
});

// Attach Methods
BatchSchema.methods.getTodayClasses = getTodayClasses;
BatchSchema.methods.modifyTodaySchedule = modifySchedule;

// Export Model
export const Batch = mongoose.model<IBatch>("Batch", BatchSchema);
