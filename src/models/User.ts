import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  profilePic?: string;
  education?: {
    institute?: string;
    degree?: string;
    session?: string;
    grade?: string;
  };
  posts: mongoose.Schema.Types.ObjectId[];
  savedPosts: mongoose.Schema.Types.ObjectId[];
  chats: mongoose.Schema.Types.ObjectId[];
  batchChatId: mongoose.Schema.Types.ObjectId | null;
  followers: mongoose.Schema.Types.ObjectId[];
  following: mongoose.Schema.Types.ObjectId[];
  notifications: mongoose.Schema.Types.ObjectId[];
  batch: mongoose.Schema.Types.ObjectId | null;
  role: "Student" | "Teacher" | "Admin";
  isOnline: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/dax7yvopb/image/upload/v1738953944/user_dwpdoy.png",
    },
    education: {
      institute: { type: String },
      degree: { type: String },
      session: { type: String },
      grade: { type: String },
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    batchChatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Student",
    },
    isOnline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
