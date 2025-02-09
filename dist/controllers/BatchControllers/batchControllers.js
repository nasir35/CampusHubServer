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
exports.removeMember = exports.addMember = exports.updateBatch = exports.deleteBatch = exports.leaveBatch = exports.joinBatch = exports.getBatchById = exports.getBatches = exports.createBatch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Batch_1 = require("../../models/Batch/Batch");
const Member_1 = __importDefault(require("../../models/Batch/Member"));
const Chat_1 = require("../../models/Chat");
const User_1 = require("../../models/User");
const helper_1 = require("../../utils/helper");
// Create a new batch
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchName, description, batchType, institute, batchPic } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const createdBy = req.user.id;
        const admin = new Member_1.default({
            userId: createdBy,
            role: "admin",
        });
        const newBatch = new Batch_1.Batch({
            batchName,
            description,
            batchType,
            institute,
            batchPic,
            createdBy,
            membersList: [admin._id],
        });
        if (!newBatch.batchCode) {
            newBatch.batchCode = (0, helper_1.generateUniqueCode)();
        }
        while (yield mongoose_1.default.models.Batch.findOne({ batchCode: newBatch.batchCode })) {
            newBatch.batchCode = (0, helper_1.generateUniqueCode)();
        }
        yield newBatch.save();
        //create new batch chat 
        let members = [];
        // Add creator to the members list
        if (!members.includes(createdBy)) {
            members.push(createdBy);
        }
        // Create new group chat
        console.log("batch saved");
        const newChat = new Chat_1.Chat({ isGroup: true, name: batchName, members });
        const resp = yield newChat.save();
        console.log("new chat saved", resp);
        // Add chat reference to all members
        yield User_1.User.updateMany({ _id: { $in: members } }, { $push: { chats: newChat._id } });
        res.status(201).json({ success: true, message: "Batch created successfully", data: newBatch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.createBatch = createBatch;
// Get all batches
const getBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield Batch_1.Batch.find().populate("createdBy", "name email");
        res.status(200).json({ success: true, message: `Found ${batches.length} Batches.`, data: batches });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getBatches = getBatches;
// Get batch by ID
const getBatchById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({ success: false, message: "Invalid Batch ID" });
        }
        const batch = yield Batch_1.Batch.findById(batchId).populate("createdBy", "name email");
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        res.status(200).json({ success: true, data: batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getBatchById = getBatchById;
const joinBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchCode } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findOne({ batchCode });
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        // Check if user is already a member
        const isMember = batch.membersList.some((member) => member.userId.toString() === userId);
        if (isMember) {
            return res.status(400).json({ success: false, message: "Already a member" });
        }
        // Convert userId to ObjectId if needed
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // Ensure the correct object structure when adding a new member
        batch.membersList.push({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            role: "member",
        });
        yield batch.save();
        return res.status(200).json({
            success: true,
            message: "Joined batch successfully",
            data: batch,
        });
    }
    catch (error) {
        console.error("Error joining batch:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.joinBatch = joinBatch;
// Leave a batch
const leaveBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        batch.membersList = batch.membersList.filter((member) => member.userId.toString() !== userId);
        yield batch.save();
        res.status(200).json({ success: true, message: "Left batch successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.leaveBatch = leaveBatch;
// Delete a batch (Admin Only)
const deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        if (batch.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        yield Batch_1.Batch.findByIdAndDelete(batchId);
        res.status(200).json({ success: true, message: "Batch deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.deleteBatch = deleteBatch;
const updateBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { batchId } = req.params;
        const { updateData } = req.body; // Accept dynamic fields
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        // Check if the user is an admin or moderator
        const member = batch.membersList.find((m) => m.userId.toString() === userId);
        if (!member || (member.role !== "admin" && member.role !== "moderator")) {
            return res.status(403).json({ success: false, message: "Forbidden: Admin or Moderator access required" });
        }
        // Perform update using $set
        const updatedBatch = yield Batch_1.Batch.findByIdAndUpdate(batchId, { $set: updateData }, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Batch updated successfully", data: updatedBatch });
    }
    catch (error) {
        console.error("Update Batch Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.updateBatch = updateBatch;
// Add a member to the batch (only admins)
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const { userId, role } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        const isAlreadyMember = batch.membersList.some((m) => m.userId.toString() === userId);
        if (isAlreadyMember) {
            return res.status(400).json({ success: false, message: "User is already a member" });
        }
        batch.membersList.push({ userId: new mongoose_1.default.Types.ObjectId(userId), role: role || "member" });
        yield batch.save();
        res.status(200).json({ success: true, message: "Member added successfully", data: batch });
    }
    catch (error) {
        console.error("Add Member Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.addMember = addMember;
// Remove a member from the batch (only admins)
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const { memberId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        batch.membersList = batch.membersList.filter((m) => m.userId.toString() !== memberId);
        yield batch.save();
        res.status(200).json({ success: true, message: "Member removed successfully", data: batch });
    }
    catch (error) {
        console.error("Remove Member Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.removeMember = removeMember;
