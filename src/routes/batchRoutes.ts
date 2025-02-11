import express from "express";
import {
  addMember,
  createBatch,
  deleteBatch,
  getAllMembers,
  getBatchById,
  getBatches,
  joinBatchController,
  leaveBatch,
  removeMember,
  updateBatch,
} from "../controllers/BatchControllers/batchControllers";
import { authenticateUser } from "../middlewares/authMiddleware";
import { authorizeBatchAdmin } from "../middlewares/authorizeBatchAdmin";
// import { modifyTodayScheduleController } from "../models/Batch/Schedule";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getSingleAnnouncement,
} from "../controllers/BatchControllers/announcementController";
import {
  archiveRoutine,
  createRoutine,
  getRoutinesForBatch,
} from "../controllers/BatchControllers/routineController";
import {
  createSchedule,
  getSchedulesForRoutine,
  getTodayClasses,
  getTomorrowsClasses,
  modifySchedule,
} from "../controllers/BatchControllers/scheduleController";

const router = express.Router();

// Get all batches
router.get("/", getBatches);
// Get batch details by ID
router.get("/details/:batchId", authenticateUser, getBatchById);

//Get all members of a  batch
router.get("/members/:batchId", getAllMembers);

// Create a new batch
router.post("/create", authenticateUser, createBatch); //{ batchName, description, batchType, institute, batchPic }

router.post("/join/:batchId", authenticateUser, joinBatchController);
router.post("/leave/:batchId", authenticateUser, leaveBatch);

// Add a member to the batch (only admins)
router.post("/add/:batchId", authenticateUser, authorizeBatchAdmin, addMember); //{ userId, role }

// Update batch info (only admins/moderators)
router.put("/update/:batchId", authenticateUser, authorizeBatchAdmin, updateBatch); //{updateData}

// Modify today's schedule (cancel/reschedule/add/delete classes)
// router.put(
//   "/schedule/:batchId",
//   authenticateUser,
//   authorizeBatchAdmin,
//   modifyTodayScheduleController
// ); //{ action, subjectData }
// {
//   days: string[]; // e.g., ["Monday", "Wednesday"]
//   time: string; // e.g., "10:00 AM - 12:00 PM"
//   subject: string;
//   instructor?: string;
//   canceled?: boolean;
// }

// Remove a member from the batch (only admins)
router.delete("/remove/:batchId", authenticateUser, authorizeBatchAdmin, removeMember); //{ memberId }

// Delete a batch
router.delete("/delete/:batchId", deleteBatch);

/*********************Announcement Route*********************************/

router.get("/announcements", authenticateUser, getAnnouncements);
router.get("/announcements/:id", authenticateUser, getSingleAnnouncement);
router.post("/announcements", authenticateUser, authorizeBatchAdmin, createAnnouncement); //{ title, message, batchId, createdBy }
router.put("/announcements/update/:id", authenticateUser, authorizeBatchAdmin, updateAnnouncement); //{batchId, update }
router.delete("/announcements/:id", authenticateUser, authorizeBatchAdmin, deleteAnnouncement); //<header>{ batchId }

/****************************Routine Routes******************************* */
router.get("/routines/:batchId", authenticateUser, getRoutinesForBatch);
router.post("/routines/create", authenticateUser, createRoutine); //{ name, startDate, endDate, batchId, createdBy, status }
router.post("/routines/status/:routineId", archiveRoutine);

/****************************Schedule Routes******************************* */
router.post("/schedules/create", authenticateUser, authorizeBatchAdmin, createSchedule); //{ batchId, subject, startTime, endTime, dayOfWeek, routineId, classroom, isBreak, group }
router.get("/schedules/:routineId", authenticateUser, getSchedulesForRoutine); //{batchId}
router.get("/schedules/today-classes/:batchId", authenticateUser, getTodayClasses);
router.get("/schedules/tomorrow-classes/:batchId", authenticateUser, getTomorrowsClasses);
router.put("/schedules/modify/:scheduleId", authenticateUser, authorizeBatchAdmin, modifySchedule); // {batchId, action, updateData} Note: allowed action type: 'add', 'update', 'cancel', 'delete'

export default router;
