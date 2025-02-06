"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAllUsers = exports.unfollowUser = exports.followUser = exports.updateUserProfile = exports.getMe = exports.getUserById = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, mobile, profilePic } = req.body;
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User({
            name,
            email,
            password: hashedPassword,
            mobile,
            profilePic,
        });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ success: true, message: "User registered successfully", data: { token, user } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "failed user registration", data: error });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "No user found with this email." });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password || "");
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Password mismatch." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ success: true, message: "login success", data: { token, user } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.loginUser = loginUser;
// Get User Profile
exports.getUserProfile = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = yield User_1.User.findOne({ email: email.toString() });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "user found successfully", data: user });
}));
exports.getUserById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User Id is required" });
    }
    const user = yield User_1.User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "user found successfully", data: user });
}));
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield User_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getMe = getMe;
exports.updateUserProfile = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userData = req.body;
    // Find user by ID
    const user = yield User_1.User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    // Update user fields dynamically
    Object.assign(user, userData);
    yield user.save();
    res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
}));
// Follow a User
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userToFollowId, currentUserId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userToFollowId) || !mongoose_1.default.Types.ObjectId.isValid(currentUserId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const userToFollow = yield User_1.User.findById(new mongoose_1.default.Types.ObjectId(userToFollowId));
        const currentUser = yield User_1.User.findById(new mongoose_1.default.Types.ObjectId(currentUserId));
        if (userToFollowId === currentUserId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }
        if (!userToFollow || !currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (currentUser.following.includes(userToFollow._id)) {
            return res.status(400).json({ success: false, message: "You are already following this user" });
        }
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);
        yield currentUser.save();
        yield userToFollow.save();
        res.status(200).json({ success: true, message: "User followed successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.followUser = followUser;
// Unfollow a User
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToUnfollow = yield User_1.User.findById(req.params.userToUnfollowId);
        const currentUser = yield User_1.User.findById(req.params.currentUserId);
        if (!userToUnfollow || !currentUser)
            return res.status(404).json({ success: false, message: "User not found" });
        currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id);
        userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id);
        yield currentUser.save();
        yield userToUnfollow.save();
        res.status(200).json({ success: true, message: "User unfollowed" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.unfollowUser = unfollowUser;
// Get all Users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().select("-password");
        res.status(200).json({ success: true, message: `${users.length} users found`, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllUsers = getAllUsers;
// Delete User
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteUser = deleteUser;
