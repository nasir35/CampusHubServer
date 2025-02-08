import mongoose, { Schema, Document, Types } from "mongoose";

export interface IResource extends Document {
  title: string;
  url: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
export default Resource;
