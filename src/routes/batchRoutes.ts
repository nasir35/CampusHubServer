import express from "express";
import {
  addMember,
  createBatch,
  deleteBatch,
  getAllMembers,
  getBatchById,
  getBatches,
  removeMember,
  updateBatch,
} from "../controllers/BatchControllers/batchControllers";
import { authenticateUser } from "../middlewares/authMiddleware";
import { authorizeBatchAdmin } from "../middlewares/authorizeBatchAdmin";
import { modifyTodayScheduleController } from "../models/Batch/Schedule";

const router = express.Router();

// Get all batches
router.get("/", getBatches);
// Get batch details by ID
router.get("/:batchId", authenticateUser, getBatchById);

//Get all members of a  batch
router.get("/members/:batchId", getAllMembers);

// Create a new batch
router.post("/create", authenticateUser, createBatch); //{ batchName, description, batchType, institute, batchPic }

// Add a member to the batch (only admins)
router.post("/add/:batchId", authenticateUser, authorizeBatchAdmin, addMember); //{ userId, role }

// Update batch info (only admins/moderators)
router.put("/update/:batchId", authenticateUser, authorizeBatchAdmin, updateBatch); //{updateData}

// Modify today's schedule (cancel/reschedule/add/delete classes)
router.put(
  "/schedule/:batchId",
  authenticateUser,
  authorizeBatchAdmin,
  modifyTodayScheduleController
); //{ action, subjectData }
// {
//   days: string[]; // e.g., ["Monday", "Wednesday"]
//   time: string; // e.g., "10:00 AM - 12:00 PM"
//   subject: string;
//   instructor?: string;
//   canceled?: boolean;
// }

// Remove a member from the batch (only admins)
router.delete("/remove/:batchId", authenticateUser, authorizeBatchAdmin, removeMember); //{ memberId }

router.delete("/delete/:batchId", deleteBatch);

export default router;
