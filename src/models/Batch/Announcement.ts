import mongoose, { Schema, Document, Types } from "mongoose";

// Define Announcement Interface
export interface IAnnouncement extends Document {
  title: string; // Title of the announcement
  message: string; // The content of the announcement
  batch: Types.ObjectId; // Reference to the batch this announcement belongs to
  createdBy: Types.ObjectId; // The user who created the announcement
  isActive: boolean; // Whether the announcement is active or archived
  createdAt: Date;
  updatedAt: Date;
}

// Define Schema
const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true }, // Active by default
  },
  { timestamps: true }
);

// Export Model
export const Announcement = mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
