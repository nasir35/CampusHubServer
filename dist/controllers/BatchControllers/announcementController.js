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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.updateAnnouncement = exports.createAnnouncement = exports.getSingleAnnouncement = exports.getAnnouncements = void 0;
const Announcement_1 = require("../../models/Batch/Announcement");
const Batch_1 = require("../../models/Batch/Batch");
const getAnnouncements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const announcements = yield Announcement_1.Announcement.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: `Found ${announcements.length} announcements.`,
            data: announcements,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error! Couldn't find announcements." });
    }
});
exports.getAnnouncements = getAnnouncements;
const getSingleAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const announcement = yield Announcement_1.Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        res.status(200).json({ success: true, message: "Announcement found.", data: announcement });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error! Couldn't find announcement." });
    }
});
exports.getSingleAnnouncement = getSingleAnnouncement;
const createAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, message, batchId, createdBy } = req.body;
        if (!title || !message || !batchId || !createdBy) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Create the announcement
        const newAnnouncement = yield Announcement_1.Announcement.create({
            title,
            message,
            batchId,
            createdBy,
            isActive: true,
        });
        // Add the announcement to the batch
        yield Batch_1.Batch.findByIdAndUpdate(batchId, { $push: { announcements: newAnnouncement._id } }, { new: true });
        res.status(201).json({ success: true, message: "Created successfully", data: newAnnouncement });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error creating announcement" });
    }
});
exports.createAnnouncement = createAnnouncement;
const updateAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { update } = req.body;
        if (!update) {
            return res.status(400).json({ success: false, message: "No update provided" });
        }
        const updatedAnnouncement = yield Announcement_1.Announcement.findByIdAndUpdate(id, { $set: update }, { new: true, upsert: true });
        if (!updatedAnnouncement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        res
            .status(200)
            .json({ success: true, message: "updated announcement", data: updatedAnnouncement });
    }
    catch (error) {
        res.status(500).json({ success: true, message: "Error updating announcement" });
    }
});
exports.updateAnnouncement = updateAnnouncement;
const deleteAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { batchId } = req.body;
        // Delete the announcement
        const deletedAnnouncement = yield Announcement_1.Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        // Remove the announcement reference from the batch
        yield Batch_1.Batch.findByIdAndUpdate(batchId, {
            $pull: { announcements: id },
        });
        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error deleting announcement" });
    }
});
exports.deleteAnnouncement = deleteAnnouncement;
