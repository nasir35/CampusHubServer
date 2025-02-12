"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const batchControllers_1 = require("../controllers/BatchControllers/batchControllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizeBatchAdmin_1 = require("../middlewares/authorizeBatchAdmin");
// import { modifyTodayScheduleController } from "../models/Batch/Schedule";
const announcementController_1 = require("../controllers/BatchControllers/announcementController");
const routineController_1 = require("../controllers/BatchControllers/routineController");
const scheduleController_1 = require("../controllers/BatchControllers/scheduleController");
const router = express_1.default.Router();
/****************************Batch Routes******************************* */
router.get("/", batchControllers_1.getBatches);
router.get("/details/:batchId", authMiddleware_1.authenticateUser, batchControllers_1.getBatchById);
router.get("/members/:batchId", batchControllers_1.getAllMembers);
router.post("/create", authMiddleware_1.authenticateUser, batchControllers_1.createBatch); //{ batchName, description, batchType, institute, batchPic }
router.post("/join/:batchId", authMiddleware_1.authenticateUser, batchControllers_1.joinBatchController);
router.post("/leave/:batchId", authMiddleware_1.authenticateUser, batchControllers_1.leaveBatch);
router.post("/add/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.addMember); //{ userId, role }
router.put("/update/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.updateBatch); //{updateData}
router.delete("/remove/:batchId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, batchControllers_1.removeMember); //{ memberId }
router.delete("/delete/:batchId", batchControllers_1.deleteBatch);
/*********************Announcement Route*********************************/
router.get("/announcements", authMiddleware_1.authenticateUser, announcementController_1.getAnnouncements);
router.get("/announcements/:id", authMiddleware_1.authenticateUser, announcementController_1.getSingleAnnouncement);
router.post("/announcements/create", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.createAnnouncement); //{ title, message, batchId, createdBy }
router.put("/announcements/update/:id", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.updateAnnouncement); //{batchId, update }
router.delete("/announcements/:id", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, announcementController_1.deleteAnnouncement); //<header>{ batchId }
/****************************Routine Routes******************************* */
router.get("/routines/:batchId", authMiddleware_1.authenticateUser, routineController_1.getRoutinesForBatch);
router.post("/routines/create", authMiddleware_1.authenticateUser, routineController_1.createRoutine); //{ name, startDate, endDate, batchId, createdBy, status }
router.post("/routines/status/:routineId", routineController_1.archiveRoutine);
/****************************Schedule Routes******************************* */
router.post("/schedules/create", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, scheduleController_1.createSchedule);
//{ batchId, subject, startTime, endTime, dayOfWeek, routineId, classroom, isBreak, group }
router.get("/schedules/:routineId", authMiddleware_1.authenticateUser, scheduleController_1.getSchedulesForRoutine); //{batchId}
router.get("/schedules/today-classes/:batchId", authMiddleware_1.authenticateUser, scheduleController_1.getTodayClasses);
router.get("/schedules/tomorrow-classes/:batchId", authMiddleware_1.authenticateUser, scheduleController_1.getTomorrowsClasses);
router.put("/schedules/modify/:scheduleId", authMiddleware_1.authenticateUser, authorizeBatchAdmin_1.authorizeBatchAdmin, scheduleController_1.modifySchedule);
// {batchId, action, updateData} Note: allowed action type: 'add', 'update', 'cancel', 'delete'
exports.default = router;
