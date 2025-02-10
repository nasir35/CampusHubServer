import { Request, Response } from "express";
import { Announcement } from "../../models/Batch/Announcement";
import { Batch } from "../../models/Batch/Batch";
import { ApiResponse } from "../../types/response";

export const getAnnouncements = async (req: Request, res: Response): Promise<any> => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: `Found ${announcements.length} announcements.`,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error! Couldn't find announcements." });
  }
};

export const getSingleAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, message: "Announcement found.", data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error! Couldn't find announcement." });
  }
};

export const createAnnouncement = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<any> => {
  try {
    const { title, message, batchId, createdBy } = req.body;

    if (!title || !message || !batchId || !createdBy) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Create the announcement
    const newAnnouncement = await Announcement.create({
      title,
      message,
      batchId,
      createdBy,
      isActive: true,
    });

    // Add the announcement to the batch
    await Batch.findByIdAndUpdate(
      batchId,
      { $push: { announcements: newAnnouncement._id } },
      { new: true }
    );

    res.status(201).json({ success: true, message: "Created successfully", data: newAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating announcement" });
  }
};

export const updateAnnouncement = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<any> => {
  try {
    const { id } = req.params;
    const { update } = req.body;
    if (!update) {
      return res.status(400).json({ success: false, message: "No update provided" });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, upsert: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "updated announcement", data: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ success: true, message: "Error updating announcement" });
  }
};

export const deleteAnnouncement = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<any> => {
  try {
    const { id } = req.params;
    const { batchId } = req.body;

    // Delete the announcement
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Remove the announcement reference from the batch
    await Batch.findByIdAndUpdate(batchId, {
      $pull: { announcements: id },
    });

    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting announcement" });
  }
};
