// import mongoose, { Schema, Document } from "mongoose";
// import crypto from "crypto"; // Import crypto for unique ID generation
// import Routine, { IRoutine } from "./Routine";

// // Function to generate an 8-character alphanumeric code
// const generateUniqueCode = () => {
//   return crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates 8-character unique string
// };

// // Interface for Upcoming Classes
// interface IClass {
//   title: string;
//   description?: string;
//   date: Date;
//   link?: string; // Optional link for online classes
// }

// // Interface for Members
// interface IMember {
//   userId: mongoose.Types.ObjectId;
//   role: "admin" | "moderator" | "member"; // Define roles for batch members
// }

// // Interface for Announcements
// interface IAnnouncement {
//   message: string;
//   createdAt: Date;
// }

// // Interface for Resources
// interface IResource {
//   title: string;
//   url: string;
//   uploadedBy: mongoose.Types.ObjectId;
//   uploadedAt: Date;
// }

// // Define Batch Interface
// export interface IBatch extends Document {
//   name: string;
//   code: string;
//   institute : string;
//   description?: string;
//   createdBy: mongoose.Types.ObjectId;
//   batchType: "public" | "private";
//   profilePic?: string;
//   routines: IRoutine[]; // Define array for routines
//   upcomingClasses: IClass[];
//   membersList: IMember[];
//   announcements: IAnnouncement[];
//   resources: IResource[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Define Schema
// const BatchSchema = new Schema<IBatch>(
//   {
//     name: { type: String, required: true },
//     code: { type: String, required: true, unique: true },
//     description: { type: String },
//     createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     batchType: { type: String, enum: ["public", "private"], default: "public" },
//     profilePic: { type: String },
//     routines: []

//     // Upcoming Classes
//     upcomingClasses: [
//       {
//         subject: { type: String, required: true },
//         Teacher: { type: String },
//         date: { type: Date, required: true },
//         link: { type: String },
//       },
//     ],

//     // Members List
//     membersList: [
//       {
//         userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//         role: { type: String, enum: ["admin", "moderator", "member"], default: "member" },
//       },
//     ],

//     // Announcements
//     announcements: [
//       {
//         message: { type: String, required: true },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],

//     // Resources
//     resources: [
//       {
//         title: { type: String, required: true },
//         url: { type: String, required: true },
//         uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//         uploadedAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true } // Automatically adds createdAt & updatedAt
// );
// BatchSchema.methods.getTodayClasses = function () {
//   const today = new Date().toLocaleString("en-US", { weekday: "long" }); // Get current day name
//   const currentRoutine: IRoutine | null = await Routine.findOne({
//     _id: this.currentRoutineId,
//   });

//   if (!currentRoutine) return [];

//   return currentRoutine.schedule.filter((cls) => cls.days.includes(today));
// };
// BatchSchema.methods.modifyTodaySchedule = function (action, subjectData) {
//   const today = new Date().toLocaleString("en-US", { weekday: "long" });

//   const currentRoutine = this.routines.find(
//     (routine) => routine._id.toString() === this.currentRoutineId?.toString()
//   );

//   if (!currentRoutine) return { success: false, message: "No active routine found" };

//   switch (action) {
//     case "add":
//       currentRoutine.schedule.push(subjectData);
//       break;
//     case "delete":
//       currentRoutine.schedule = currentRoutine.schedule.filter(
//         (cls) => cls.subject !== subjectData.subject || !cls.days.includes(today)
//       );
//       break;
//     case "reschedule":
//       const classToUpdate = currentRoutine.schedule.find(
//         (cls) => cls.subject === subjectData.subject && cls.days.includes(today)
//       );
//       if (classToUpdate) {
//         classToUpdate.time = subjectData.newTime;
//       }
//       break;
//     case "cancel":
//       currentRoutine.schedule = currentRoutine.schedule.map((cls) => {
//         if (cls.subject === subjectData.subject && cls.days.includes(today)) {
//           return { ...cls, canceled: true };
//         }
//         return cls;
//       });
//       break;
//   }
//    return { success: true, message: `Subject ${action}d successfully` };
// };

// BatchSchema.pre("save", async function (next) {
//   const batch = this as IBatch;
//   while (await mongoose.models.Batch.findOne({ code: batch.code })) {
//     batch.code = generateUniqueCode(); // Regenerate if not unique
//   }
//   next();
// });
// // Export Model
// const Batch = mongoose.model<IBatch>("Batch", BatchSchema);
// export default Batch;
