import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthReq } from "../../middlewares/authMiddleware";
import { Batch, IBatch } from "../../models/Batch/Batch";
import { Chat } from "../../models/Chat";
import { IUser, User } from "../../models/User";
import { generateUniqueCode } from "../../utils/helper";
import { Schedule } from "../../models/Batch/Schedule";
import { Announcement } from "../../models/Batch/Announcement";
import { Resource } from "../../models/Batch/Resources";
import { IMember, Member } from "../../models/Batch/Member";
import { Routine } from "../../models/Batch/Routine";
import { Message } from "../../models/Message";

export const createBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchName, description, batchType, institute, batchPic } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const createdBy = req.user.id;

    // Create and save the admin member
    const admin: any = await new Member({ user: createdBy, role: "admin", batch: null }).save();

    // Initialize new batch
    const newBatch: IBatch = new Batch({
      batchName,
      description,
      batchType,
      institute,
      batchPic,
      createdBy,
      membersList: [{ userId: new mongoose.Types.ObjectId(createdBy), memberId: admin._id }],
    });
    // Generate a unique batchCode
    do {
      newBatch.batchCode = generateUniqueCode();
    } while (await Batch.exists({ batchCode: newBatch.batchCode }));

    admin.batch = newBatch._id;
    admin.save();
    // Create new batch chat
    let members = [createdBy];
    const newChat: any = new Chat({ isGroup: true, name: batchName, members });
    const resp = await newChat.save();

    newBatch.chatId = newChat._id;
    await newBatch.save();
    console.log("Batch saved successfully");

    // Add chat & batch reference to all members
    await User.updateMany(
      { _id: { $in: members } },
      { $set: { batchChatId: newChat._id, batch: newBatch._id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, message: "Batch created successfully", data: newBatch });
  } catch (error) {
    // console.error("Error creating batch:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create batch", error: (error as any).message });
  }
};

// Get all batches
export const getBatches = async (req: Request, res: Response): Promise<any> => {
  try {
    const batches = await Batch.find().populate("createdBy", "name email");
    res
      .status(200)
      .json({ success: true, message: `Found ${batches.length} Batches.`, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get batch by ID
export const getBatchById = async (req: Request, res: Response): Promise<any> => {
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

// Controller to join a batch
export const joinBatchController = async (req: AuthReq, res: Response): Promise<any> => {
  const { batchId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const existingMember = await Member.findOne({ user: userId, batch: batchId });
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
    const newMember: IMember = new Member({
      user: userId,
      batch: batchId,
      role: "student", // Default role; could be passed if needed
      status: "active", // Mark the user as active in the batch
    });
    await newMember.save();

    // Update the batch's membersList with the new member
    batch.membersList.push({
      userId: new mongoose.Types.ObjectId(userId),
      memberId: newMember._id,
    }); // Add member to the batch
    await batch.save();

    const user: any = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { batch: batch._id, batchChatId: batch.chatId } },
        { new: true, upsert: true }
      );
    }
    // Return success response
    return res.status(200).json({ message: "Successfully joined the batch", batch, newMember });
  } catch (error) {
    console.error("Error joining batch:", error);
    return res.status(500).json({ message: "An error occurred while joining the batch", error });
  }
};

// Leave a batch
export const leaveBatch = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId: any = req.user.id;

    const batch: IBatch | null = await Batch.findById(batchId);
    const user: IUser | null = await User.findById(userId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //check if user exist in the batch
    const memberId = batch.membersList.find(
      (m) => m.userId.toString() === new mongoose.Types.ObjectId(userId).toString()
    );
    if (!memberId) {
      return res.status(404).json({ success: false, message: "User not found in the batch" });
    }

    batch.membersList = batch.membersList.filter(
      (member) => member.userId.toString() !== new mongoose.Types.ObjectId(userId).toString()
    );
    await batch.save();

    await Member.findByIdAndDelete(userId);

    user.batch = null;
    user.batchChatId = null;
    user.save();

    res.status(200).json({ success: true, message: "Left batch successfully" });
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
    const { updateData } = req.body; // Accept dynamic fields
    const userId = req.user.id;

    if (!updateData) {
      return res.status(400).json({
        success: false,
        message: "No update data provided! use (updateData) object to update.",
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (req.user.role !== "Admin") {
      // Check if the user is an admin or moderator
      const memberId = batch.membersList.find(
        (m) => m.userId.toString() === new mongoose.Types.ObjectId(userId).toString()
      );
      const member: IMember | null = await Member.findById(memberId);
      if (!member || (member.role !== "admin" && member.role !== "moderator")) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Admin or Moderator access required" });
      }
    }
    // Perform update using $set
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      { $set: updateData },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Batch updated successfully", data: updatedBatch });
  } catch (error) {
    console.error("Update Batch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a member to the batch (only admins)
export const addMember = async (req: AuthReq, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    const { userId, role } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const batch: IBatch | null = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    const foundUser: any = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAlreadyMember = batch.membersList.some(
      (member: any) => member.userId.toString() === new mongoose.Types.ObjectId(userId).toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }
    const newMember: IMember = new Member({
      user: new mongoose.Types.ObjectId(userId),
      role,
      batch: batch._id,
    });
    await newMember.save();
    batch.membersList.push({
      userId: new mongoose.Types.ObjectId(userId),
      memberId: newMember._id,
    });
    await batch.save();

    await User.findByIdAndUpdate(
      userId,
      { $set: { batch: batch._id, role: role, batchChatId: batch.chatId } },
      { new: true, upsert: true }
    );

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
    const { userId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const batch: IBatch | null = await Batch.findById(batchId);
    const user: IUser | null = await User.findById(userId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //check if user exist in the batch
    const memberId = batch.membersList.find(
      (m) => m.userId.toString() === new mongoose.Types.ObjectId(userId).toString()
    );
    if (!memberId) {
      return res.status(404).json({ success: false, message: "User not found in the batch" });
    }

    batch.membersList = batch.membersList.filter(
      (m: any) => m.userId?.toString() !== new mongoose.Types.ObjectId(userId).toString()
    );
    await batch.save();

    await Member.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId) });

    await User.findByIdAndUpdate(
      userId,
      { $set: { batch: null, batchChatId: null } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Member removed successfully", data: batch });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllMembers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    const members = await Member.find({ batch: batch._id }).populate({
      path: "user", // Field to populate
      model: "User",
      select: "name email profilePic", // Only return these fields
    });
    return res
      .status(200)
      .json({ success: true, message: `found ${members.length} members`, data: members });
  } catch (err) {
    console.error("Error fetching members:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteBatch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    const { userId } = req.body;

    // Find the batch
    const batch = await Batch.findById(batchId);
    const user = await User.findById(userId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (user?.role !== "Admin") {
      // Check if the user is an admin
      const memberId = batch.membersList.find(
        (member: any) => member.userId.toString() === new mongoose.Types.ObjectId(userId).toString()
      );
      const member: IMember | null = await Member.findById(memberId);
      if (!member || member.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Admin access required" });
      }
    }

    // Delete related chat
    if (batch.chatId) {
      // delete all messages that are associated with chatId
      await Message.deleteMany({ chatId: batch.chatId });
      // delete the chat itself
      await Chat.findByIdAndDelete(batch.chatId);
    }

    // Delete related data
    await Announcement.deleteMany({ _id: { $in: batch.announcements } });
    await Resource.deleteMany({ _id: { $in: batch.resources } });
    await Member.deleteMany({ _id: { $in: batch.membersList } });
    await Routine.deleteMany({ batchId: batch._id });
    await Schedule.deleteMany({ batchId: batch._id });

    // Finally, delete the batch
    await Batch.findByIdAndDelete(batchId);

    return res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};
