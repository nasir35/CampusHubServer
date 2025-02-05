import express from "express";
import { registerUser, loginUser, getUserProfile, getAllUsers, updateUserProfile, followUser } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/profile", getUserProfile);
router.put("/:userId", updateUserProfile);
router.post("/follow/:currentUserId/:userToFollowId", followUser);
export default router;
