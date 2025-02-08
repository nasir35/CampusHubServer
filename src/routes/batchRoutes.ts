import express from "express";
import { addMember, createBatch, getBatchById, getBatches, removeMember, updateBatch } from "../controllers/BatchControllers/batchControllers";
import { authenticateUser } from "../middlewares/authMiddleware";
import { authorizeBatchAdmin } from "../middlewares/authorizeBatchAdmin";
import { modifyTodayScheduleController } from "../models/Batch/Schedule";

const router = express.Router();

// Create a new batch
router.post("/", authenticateUser, createBatch);

// Get all batches
router.get("/", getBatches);

// Get batch details by ID
router.get("/:batchId", authenticateUser, getBatchById);

// Update batch info (only admins/moderators)
router.put("/:batchId", authenticateUser, authorizeBatchAdmin, updateBatch);

// Add a member to the batch (only admins)
router.post("/:batchId/members", authenticateUser, authorizeBatchAdmin, addMember);

// Remove a member from the batch (only admins)
router.delete("/:batchId/members/:memberId", authenticateUser, authorizeBatchAdmin, removeMember);

// Modify today's schedule (cancel/reschedule/add/delete classes)
router.put("/:batchId/schedule", authenticateUser, authorizeBatchAdmin, modifyTodayScheduleController);

export default router;
