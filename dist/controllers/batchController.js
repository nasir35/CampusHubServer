"use strict";
// import { Request, Response } from "express";
// import Batch from "../models/Batch/Batch";
// import { AuthReq } from "../middlewares/authMiddleware";
// export const createBatch = async (req: AuthReq, res: Response) => {
//   try {
//     const { name, description, institute, batchType } = req.body;
//     const createdBy = req.user?.id; // Assuming authentication middleware
//     const batch = new Batch({
//       name,
//       description,
//       createdBy,
//       batchType,
//       institute,
//       membersList: [{ userId: createdBy, role: "admin" }], 
//     });
//     await batch.save();
//     res.status(201).json({ success: true, data: batch });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error creating batch", error });
//   }
// };
