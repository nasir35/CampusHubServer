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
exports.deleteBatch = exports.getAllMembers = exports.removeMember = exports.addMember = exports.updateBatch = exports.leaveBatch = exports.joinBatchController = exports.getBatchById = exports.getBatches = exports.createBatch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Batch_1 = require("../../models/Batch/Batch");
const Chat_1 = require("../../models/Chat");
const User_1 = require("../../models/User");
const helper_1 = require("../../utils/helper");
const Schedule_1 = require("../../models/Batch/Schedule");
const Announcement_1 = require("../../models/Batch/Announcement");
const Resources_1 = require("../../models/Batch/Resources");
const Member_1 = require("../../models/Batch/Member");
const Routine_1 = require("../../models/Batch/Routine");
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchName, description, batchType, institute, batchPic } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const createdBy = req.user.id;
        // Create and save the admin member
        const admin = yield new Member_1.Member({ user: createdBy, role: "admin", batch: null }).save();
        // Initialize new batch
        const newBatch = new Batch_1.Batch({
            batchName,
            description,
            batchType,
            institute,
            batchPic,
            createdBy,
            membersList: [{ userId: new mongoose_1.default.Types.ObjectId(createdBy), memberId: admin._id }],
        });
        // Generate a unique batchCode
        do {
            newBatch.batchCode = (0, helper_1.generateUniqueCode)();
        } while (yield Batch_1.Batch.exists({ batchCode: newBatch.batchCode }));
        admin.batch = newBatch._id;
        admin.save();
        // Create new batch chat
        let members = [createdBy];
        const newChat = new Chat_1.Chat({ isGroup: true, name: batchName, members });
        const resp = yield newChat.save();
        newBatch.chatId = newChat._id;
        yield newBatch.save();
        console.log("Batch saved successfully");
        // Add chat & batch reference to all members
        yield User_1.User.updateMany({ _id: { $in: members } }, { $set: { batchChatId: newChat._id, batchId: newBatch._id } }, { new: true, upsert: true });
        res.status(201).json({ success: true, message: "Batch created successfully", data: newBatch });
    }
    catch (error) {
        // console.error("Error creating batch:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to create batch", error: error.message });
    }
});
exports.createBatch = createBatch;
// Get all batches
const getBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield Batch_1.Batch.find().populate("createdBy", "name email");
        res
            .status(200)
            .json({ success: true, message: `Found ${batches.length} Batches.`, data: batches });
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
// Controller to join a batch
const joinBatchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { batchId } = req.params;
    const { userId } = req.body;
    try {
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        const existingMember = yield Member_1.Member.findOne({ user: userId, batch: batchId });
        if (existingMember) {
            return res.status(400).json({ message: "User is already a member of this batch" });
        }
        // Check if the batch is private (optional, based on your app logic)
        if (batch.batchType === "Private") {
            // Add more checks for invitation or permission if needed
            // You might want to ensure that the user has been invited or is authorized
            // For now, we assume the user can join regardless
        }
        // Create a new member document for the user
        const newMember = new Member_1.Member({
            user: userId,
            batch: batchId,
            role: "student", // Default role; could be passed if needed
            status: "active", // Mark the user as active in the batch
        });
        yield newMember.save();
        // Update the batch's membersList with the new member
        batch.membersList.push({ userId, memberId: newMember._id }); // Add member to the batch
        yield batch.save();
        const user = yield User_1.User.findById(userId);
        if (user) {
            yield User_1.User.findByIdAndUpdate(userId, { $set: { batch: batch._id, batchChatId: batch.chatId } }, { new: true, upsert: true });
        }
        // Return success response
        return res.status(200).json({ message: "Successfully joined the batch", batch, newMember });
    }
    catch (error) {
        console.error("Error joining batch:", error);
        return res.status(500).json({ message: "An error occurred while joining the batch", error });
    }
});
exports.joinBatchController = joinBatchController;
// Leave a batch
const leaveBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;
        const batch = yield Batch_1.Batch.findById(batchId);
        const user = yield User_1.User.findById(userId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        //check if user exist in the batch
        const memberId = batch.membersList.find((m) => m.userId.toString() === new mongoose_1.default.Types.ObjectId(userId).toString());
        if (!memberId) {
            return res.status(404).json({ success: false, message: "User not found in the batch" });
        }
        batch.membersList = batch.membersList.filter((member) => member.userId.toString() !== new mongoose_1.default.Types.ObjectId(userId).toString());
        yield batch.save();
        yield Member_1.Member.findByIdAndDelete(userId);
        user.batch = null;
        user.batchChatId = null;
        user.save();
        res.status(200).json({ success: true, message: "Left batch successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.leaveBatch = leaveBatch;
const updateBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { batchId } = req.params;
        const { updateData } = req.body; // Accept dynamic fields
        const userId = req.user.id;
        if (!updateData) {
            return res.status(400).json({
                success: false,
                message: "No update data provided! use (updateData) object to update.",
            });
        }
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        if (req.user.role !== "Admin") {
            // Check if the user is an admin or moderator
            const memberId = batch.membersList.find((m) => m.userId.toString() === new mongoose_1.default.Types.ObjectId(userId).toString());
            const member = yield Member_1.Member.findById(memberId);
            if (!member || (member.role !== "admin" && member.role !== "moderator")) {
                return res
                    .status(403)
                    .json({ success: false, message: "Forbidden: Admin or Moderator access required" });
            }
        }
        // Perform update using $set
        const updatedBatch = yield Batch_1.Batch.findByIdAndUpdate(batchId, { $set: updateData }, { new: true, upsert: true });
        res
            .status(200)
            .json({ success: true, message: "Batch updated successfully", data: updatedBatch });
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
        const foundUser = yield User_1.User.findById(userId);
        if (!foundUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isAlreadyMember = batch.membersList.some((member) => member.userId.toString() === new mongoose_1.default.Types.ObjectId(userId).toString());
        if (isAlreadyMember) {
            return res.status(400).json({ success: false, message: "User is already a member" });
        }
        const newMember = new Member_1.Member({
            user: new mongoose_1.default.Types.ObjectId(userId),
            role,
            batch: batch._id,
        });
        yield newMember.save();
        batch.membersList.push({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            memberId: newMember._id,
        });
        yield batch.save();
        yield User_1.User.findByIdAndUpdate(userId, { $set: { batch: batch._id, role: role, batchChatId: batch.chatId } }, { new: true, upsert: true });
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
        const { userId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const batch = yield Batch_1.Batch.findById(batchId);
        const user = yield User_1.User.findById(userId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        //check if user exist in the batch
        const memberId = batch.membersList.find((m) => m.userId.toString() === new mongoose_1.default.Types.ObjectId(userId).toString());
        if (!memberId) {
            return res.status(404).json({ success: false, message: "User not found in the batch" });
        }
        batch.membersList = batch.membersList.filter((m) => { var _a; return ((_a = m.userId) === null || _a === void 0 ? void 0 : _a.toString()) !== new mongoose_1.default.Types.ObjectId(userId).toString(); });
        yield batch.save();
        yield Member_1.Member.findOneAndDelete({ user: new mongoose_1.default.Types.ObjectId(userId) });
        yield User_1.User.findByIdAndUpdate(userId, { $set: { batch: null, batchChatId: null } }, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Member removed successfully", data: batch });
    }
    catch (error) {
        console.error("Remove Member Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.removeMember = removeMember;
const getAllMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const batch = yield Batch_1.Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        const members = yield Member_1.Member.find({ batch: batch._id }).populate({
            path: "user", // Field to populate
            model: "User",
            select: "name email profilePic", // Only return these fields
        });
        return res
            .status(200)
            .json({ success: true, message: `found ${members.length} members`, data: members });
    }
    catch (err) {
        console.error("Error fetching members:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getAllMembers = getAllMembers;
const deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const { userId } = req.body;
        // Find the batch
        const batch = yield Batch_1.Batch.findById(batchId);
        const user = yield User_1.User.findById(userId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found" });
        }
        if ((user === null || user === void 0 ? void 0 : user.role) !== "Admin") {
            // Check if the user is an admin
            const memberId = batch.membersList.find((member) => member.userId.toString() === new mongoose_1.default.Types.ObjectId(userId).toString());
            const member = yield Member_1.Member.findById(memberId);
            if (!member || member.role !== "admin") {
                return res
                    .status(403)
                    .json({ success: false, message: "Forbidden: Admin access required" });
            }
        }
        // Delete related chat
        if (batch.chatId) {
            yield Chat_1.Chat.findByIdAndDelete(batch.chatId);
        }
        // Delete related data
        yield Announcement_1.Announcement.deleteMany({ _id: { $in: batch.announcements } });
        yield Resources_1.Resource.deleteMany({ _id: { $in: batch.resources } });
        yield Member_1.Member.deleteMany({ _id: { $in: batch.membersList } });
        yield Routine_1.Routine.deleteMany({ _id: { $in: batch.routines } });
        yield Schedule_1.Schedule.deleteMany({ _id: { $in: batch.upcomingClasses } });
        // Finally, delete the batch
        yield Batch_1.Batch.findByIdAndDelete(batchId);
        return res.status(200).json({ success: true, message: "Batch deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting batch:", error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
});
exports.deleteBatch = deleteBatch;
