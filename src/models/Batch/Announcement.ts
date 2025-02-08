import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
  message: string;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Announcement = mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
export default Announcement;
