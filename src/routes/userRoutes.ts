import express from "express";
import { registerUser, loginUser, getUserProfile, getAllUsers, updateUserProfile, followUser, unfollowUser, deleteUser, getUserById } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/profile", getUserProfile);
router.get("/:id", getUserById);
router.put("/:userId", updateUserProfile);
router.post("/follow/:currentUserId/:userToFollowId", followUser);
router.post("/unfollow/:currentUserId/:userToUnfollowId", unfollowUser);
router.delete("deleteUserProfile/:id", deleteUser);
export default router;
