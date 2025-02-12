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

/****************************Batch Routes******************************* */
router.get("/", getBatches);
router.get("/details/:batchId", authenticateUser, getBatchById);
router.get("/members/:batchId", getAllMembers);
router.post("/create", authenticateUser, createBatch); //{ batchName, description, batchType, institute, batchPic }
router.post("/join/:batchId", authenticateUser, joinBatchController);
router.post("/leave/:batchId", authenticateUser, leaveBatch);
router.post("/add/:batchId", authenticateUser, authorizeBatchAdmin, addMember); //{ userId, role }
router.put("/update/:batchId", authenticateUser, authorizeBatchAdmin, updateBatch); //{updateData}
router.delete("/remove/:batchId", authenticateUser, authorizeBatchAdmin, removeMember); //{ memberId }
router.delete("/delete/:batchId", deleteBatch);

/*********************Announcement Route*********************************/

router.get("/announcements", authenticateUser, getAnnouncements);
router.get("/announcements/:id", authenticateUser, getSingleAnnouncement);
router.post("/announcements/create", authenticateUser, authorizeBatchAdmin, createAnnouncement); //{ title, message, batchId, createdBy }
router.put("/announcements/update/:id", authenticateUser, authorizeBatchAdmin, updateAnnouncement); //{batchId, update }
router.delete("/announcements/:id", authenticateUser, authorizeBatchAdmin, deleteAnnouncement); //<header>{ batchId }

/****************************Routine Routes******************************* */
router.get("/routines/:batchId", authenticateUser, getRoutinesForBatch);
router.post("/routines/create", authenticateUser, createRoutine); //{ name, startDate, endDate, batchId, createdBy, status }
router.post("/routines/status/:routineId", archiveRoutine);

/****************************Schedule Routes******************************* */
router.post("/schedules/create", authenticateUser, authorizeBatchAdmin, createSchedule);
//{ batchId, subject, startTime, endTime, dayOfWeek, routineId, classroom, isBreak, group }
router.get("/schedules/:routineId", authenticateUser, getSchedulesForRoutine); //{batchId}
router.get("/schedules/today-classes/:batchId", authenticateUser, getTodayClasses);
router.get("/schedules/tomorrow-classes/:batchId", authenticateUser, getTomorrowsClasses);
router.put("/schedules/modify/:scheduleId", authenticateUser, authorizeBatchAdmin, modifySchedule);
// {batchId, action, updateData} Note: allowed action type: 'add', 'update', 'cancel', 'delete'

export default router;
