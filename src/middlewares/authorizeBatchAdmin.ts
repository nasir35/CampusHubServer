import { Request, Response, NextFunction } from "express";
import { AuthReq } from "./authMiddleware";
import Batch from "../models/Batch/Batch";

export const authorizeBatchAdmin = async (req: AuthReq, res: Response, next: NextFunction):Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { batchId } = req.params; // Get batchId from request params
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

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
