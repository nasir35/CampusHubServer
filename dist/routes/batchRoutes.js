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
const announcementController_1 = require("../controllers/BatchControllers/announcementController");
const router = express_1.default.Router();
// Get all batches
router.get("/", batchControllers_1.getBatches);
// Get batch details by ID
router.get("/details/:batchId", authMiddleware_1.authenticateUser, batchControllers_1.getBatchById);
//Get all members of a  batch
router.get("/members/:batchId", batchControllers_1.getAllMembers);
// Create a new batch
router.post("/create", authMiddleware_1.authenticateUser, batchControllers_1.createBatch); //{ batchName, description, batchType, institute, batchPic }
// Add a member to the batch (only admins)
router.post("/add/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.addMember); //{ userId, role }
// Update batch info (only admins/moderators)
router.put("/update/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.updateBatch); //{updateData}
// Modify today's schedule (cancel/reschedule/add/delete classes)
router.put("/schedule/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, Schedule_1.modifyTodayScheduleController); //{ action, subjectData }
// {
//   days: string[]; // e.g., ["Monday", "Wednesday"]
//   time: string; // e.g., "10:00 AM - 12:00 PM"
//   subject: string;
//   instructor?: string;
//   canceled?: boolean;
// }
// Remove a member from the batch (only admins)
router.delete("/remove/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.removeMember); //{ memberId }
// Delete a batch
router.delete("/delete/:batchId", batchControllers_1.deleteBatch);
/*********************Announcement Route*********************************/
router.get("/announcements", authMiddleware_1.authenticateUser, announcementController_1.getAnnouncements);
router.get("/announcements/:id", authMiddleware_1.authenticateUser, announcementController_1.getSingleAnnouncement);
router.post("/announcements", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.createAnnouncement); //{ title, message, batchId, createdBy }
router.put("/announcements/update/:id", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.updateAnnouncement); //{batchId, update }
router.delete("/announcements/:id", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.deleteAnnouncement); //{ batchId }
/************************************************************************/
exports.default = router;
