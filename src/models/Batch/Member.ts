import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMember extends Document {
  userId: Types.ObjectId;
  role: "admin" | "moderator" | "member";
}

const MemberSchema = new Schema<IMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "moderator", "member"], default: "member" },
  },
  { timestamps: true }
);

const Member = mongoose.model<IMember>("Member", MemberSchema);
export default Member;
