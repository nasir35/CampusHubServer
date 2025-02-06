import express from "express";
import { registerUser, loginUser, getUserProfile, getAllUsers, updateUserProfile, followUser, unfollowUser, deleteUser } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/profile", getUserProfile);
router.put("/:userId", updateUserProfile);
router.post("/follow/:currentUserId/:userToFollowId", followUser);
router.post("/unfollow/:currentUserId/:userToUnfollowId", unfollowUser);
router.delete("deleteUserProfile/:id", deleteUser);
export default router;
