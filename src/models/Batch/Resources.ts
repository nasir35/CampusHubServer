import mongoose, { Schema, Document, Types } from "mongoose";

// Define Resource Interface
export interface IResource extends Document {
  resourceType: "document" | "video" | "link" | "image"; // Type of resource
  name: string; // Name of the resource
  url: string; // URL or path to the resource
  uploadedBy: Types.ObjectId; // User who uploaded the resource
  batch: Types.ObjectId; // Batch to which this resource belongs
  createdAt: Date;
  updatedAt: Date;
}

// Define Schema
const ResourceSchema = new Schema<IResource>(
  {
    resourceType: { type: String, enum: ["document", "video", "link", "image"], required: true, default : "document" },
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
  },
  { timestamps: true }
);

// Export Model
export const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
