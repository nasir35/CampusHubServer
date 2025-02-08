"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const batchControllers_1 = require("../controllers/BatchControllers/batchControllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizeBatchAdmin_1 = require("../middlewares/authorizeBatchAdmin");
const Schedule_1 = require("../models/Batch/Schedule");
const router = express_1.default.Router();
// Create a new batch
router.post("/", authMiddleware_1.authenticateUser, batchControllers_1.createBatch);
// Get all batches
router.get("/", batchControllers_1.getBatches);
// Get batch details by ID
router.get("/:batchId", authMiddleware_1.authenticateUser, batchControllers_1.getBatchById);
// Update batch info (only admins/moderators)
router.put("/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.updateBatch);
// Add a member to the batch (only admins)
router.post("/:batchId/members", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.addMember);
// Remove a member from the batch (only admins)
router.delete("/:batchId/members/:memberId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.removeMember);
// Modify today's schedule (cancel/reschedule/add/delete classes)
router.put("/:batchId/schedule", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, Schedule_1.modifyTodayScheduleController);
exports.default = router;
