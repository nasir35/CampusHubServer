"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/*********************User Routes****************** */
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.get("/", userController_1.getAllUsers);
router.get("/profile", userController_1.getUserProfile);
router.get("/me", authMiddleware_1.authenticateUser, userController_1.getMe);
router.get("/:id", userController_1.getUserById);
router.put("/:userId", userController_1.updateUserProfile);
router.post("/follow/:currentUserId/:userToFollowId", userController_1.followUser);
router.post("/unfollow/:currentUserId/:userToUnfollowId", userController_1.unfollowUser);
router.delete("deleteUserProfile/:id", userController_1.deleteUser);
exports.default = router;
