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
exports.deleteUser = exports.getAllUsers = exports.unfollowUser = exports.followUser = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = require("../models/User.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "sec4et"; // Change this to an environment variable
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, mobile, education, role } = req.body;
        const existingUser = yield User_js_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_js_1.User({
            name,
            email,
            password: hashedPassword,
            mobile,
            education,
            role,
        });
        yield user.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ token: "", user: {} });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_js_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ token: "", user: {} });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password || "");
        if (!isMatch) {
            res.status(400).json({ token: "", user: {} });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: {} });
    }
    catch (error) {
        const token = ""; // Initialize token with an empty string or appropriate value
        res.json({ token, user: {} });
    }
});
exports.loginUser = loginUser;
// Get User Profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield User_js_1.User.findOne({ email: req.params.email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserProfile = getUserProfile;
// Update User Profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const { name, mobile, education, profilePic } = req.body;
        const user = yield User_js_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.name = name || user.name;
        user.mobile = mobile || user.mobile;
        user.education = education || user.education;
        user.profilePic = profilePic || user.profilePic;
        yield user.save();
        res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserProfile = updateUserProfile;
// Follow a User
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToFollow = yield User_js_1.User.findById(req.params.userToFollowId);
        const currentUser = yield User_js_1.User.findById(req.params.currentUserId);
        if (!userToFollow || !currentUser)
            return res.status(404).json({ message: "User not found" });
        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            yield currentUser.save();
            yield userToFollow.save();
        }
        res.json({ message: "User followed" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.followUser = followUser;
// Unfollow a User
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToUnfollow = yield User_js_1.User.findById(req.params.userToUnfollowId);
        const currentUser = yield User_js_1.User.findById(req.params.currentUserId);
        if (!userToUnfollow || !currentUser)
            return res.status(404).json({ message: "User not found" });
        currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id.toString());
        userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id.toString());
        yield currentUser.save();
        yield userToUnfollow.save();
        res.json({ message: "User unfollowed" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.unfollowUser = unfollowUser;
// Get all Users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_js_1.User.find().select("-password");
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUsers = getAllUsers;
// Delete User
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_js_1.User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
