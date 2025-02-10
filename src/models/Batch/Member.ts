import mongoose, { Schema, Document, Types } from "mongoose";

// Define Member Interface
export interface IMember extends Document {
  _id: Types.ObjectId; // Unique identifier for the member
  user: Types.ObjectId; // The user reference
  role: "student" | "teacher" | "admin" | "moderator"; // Role of the member in the batch
  status: "active" | "inactive" | "pending"; // Member's status
  batch: Types.ObjectId | null; // The batch the member belongs to
  joinedAt: Date; // When the member joined the batch
  updatedAt: Date; // When the member information was last updated
}

// Define Schema
const MemberSchema = new Schema<IMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["student", "teacher", "admin", "moderator"], default: "student" },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    batch: { type: Schema.Types.ObjectId, ref: "Batch"},
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export Model
export const Member = mongoose.model<IMember>("Member", MemberSchema);
