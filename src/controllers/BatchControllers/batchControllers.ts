import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { AuthReq } from "../../middlewares/authMiddleware";
import {Batch } from "../../models/Batch/Batch";
import Member, { IMember } from "../../models/Batch/Member";
import { Chat } from "../../models/Chat";
import { User } from "../../models/User";
import { generateUniqueCode } from "../../utils/helper";

// Create a new batch
export const createBatch = async (req: AuthReq, res: Response):Promise<any> => {
  try {
    const { batchName, description, batchType, institute, batchPic } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const createdBy = req.user.id;
    const admin = new Member({
      userId: createdBy,
      role: "admin",
    });
    const newBatch = new Batch({
      batchName,
      description,
      batchType,
      institute,
      batchPic,
      createdBy,
      membersList: [admin._id],
    });
    if (!newBatch.batchCode) {
      newBatch.batchCode = generateUniqueCode();
      }
      while (await mongoose.models.Batch.findOne({ batchCode: newBatch.batchCode })) {
        newBatch.batchCode = generateUniqueCode();
      }
    await newBatch.save();
    //create new batch chat 
    let members:any = [];
    // Add creator to the members list
    if (!members.includes(createdBy)) {
      members.push(createdBy);
    }

    // Create new group chat
    console.log("batch saved")
    const newChat = new Chat({ isGroup: true, name : batchName, members });
    const resp = await newChat.save();
    console.log("new chat saved", resp)

    // Add chat reference to all members
    await User.updateMany({ _id: { $in: members } }, { $push: { chats: newChat._id } });    

    res.status(201).json({ success: true, message: "Batch created successfully", data: newBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get all batches
export const getBatches = async (req: Request, res: Response): Promise<any> => {
  try {
    const batches = await Batch.find().populate("createdBy", "name email");
    res.status(200).json({ success: true, message: `Found ${batches.length} Batches.`, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get batch by ID
export const getBatchById = async (req: Request, res: Response):Promise<any> => {
  try {
    const { batchId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ success: false, message: "Invalid Batch ID" });
    }

    const batch = await Batch.findById(batchId).populate("createdBy", "name email");
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const joinBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchCode } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    const batch = await Batch.findOne({batchCode });

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Check if user is already a member
    const isMember = batch.membersList.some((member) => member.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({ success: false, message: "Already a member" });
    }

    // Convert userId to ObjectId if needed
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Ensure the correct object structure when adding a new member
    batch.membersList.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: "member",
    } as IMember);

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Joined batch successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Error joining batch:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Leave a batch
export const leaveBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.id;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    batch.membersList = batch.membersList.filter((member) => member.userId.toString() !== userId);
    await batch.save();

    res.status(200).json({ success: true, message: "Left batch successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a batch (Admin Only)
export const deleteBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.id;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (batch.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Batch.findByIdAndDelete(batchId);
    res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { batchId } = req.params;
    const {updateData} = req.body; // Accept dynamic fields
    const userId = req.user.id;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Check if the user is an admin or moderator
    const member = batch.membersList.find((m) => m.userId.toString() === userId);
    if (!member || (member.role !== "admin" && member.role !== "moderator")) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin or Moderator access required" });
    }

    // Perform update using $set
    const updatedBatch = await Batch.findByIdAndUpdate(batchId, { $set: updateData }, { new: true, upsert: true });

    res.status(200).json({ success: true, message: "Batch updated successfully", data: updatedBatch });
  } catch (error) {
    console.error("Update Batch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a member to the batch (only admins)
export const addMember = async (req: AuthReq, res: Response):Promise<any> => {
  try {
    const { batchId } = req.params;
    const { userId, role } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const isAlreadyMember = batch.membersList.some((m) => m.userId.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    batch.membersList.push({ userId: new mongoose.Types.ObjectId(userId), role: role || "member" } as IMember);
    await batch.save();

    res.status(200).json({ success: true, message: "Member added successfully", data: batch });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove a member from the batch (only admins)
export const removeMember = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    const { memberId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    batch.membersList = batch.membersList.filter((m) => m.userId.toString() !== memberId);
    await batch.save();

    res.status(200).json({ success: true, message: "Member removed successfully", data: batch });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


