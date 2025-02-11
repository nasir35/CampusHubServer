import { Request, Response } from "express";
import { Routine } from "../../models/Batch/Routine";
import { Batch } from "../../models/Batch/Batch";

export const createRoutine = async (req: Request, res: Response) => {
  try {
    let { name, startDate, endDate, batchId, createdBy, status } = req.body;
    startDate = startDate ? startDate : new Date(Date.now());
    status = status ? status : "active";
    const routine = new Routine({
      name,
      startDate,
      endDate,
      batchId,
      createdBy,
      status,
    });

    await routine.save();
    await Batch.findByIdAndUpdate(
      batchId,
      {
        $set: { currentRoutineId: routine._id },
      },
      { new: true, runValidators: true }
    );

    await Routine.updateMany(
      { _id: { $ne: routine._id } }, // Find all routines except the current one
      { $set: { status: "archived" } } // Update status to archived
    );

    res.status(201).json({ success: true, routine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating routine", error });
  }
};

// Get all routines for a batch
export const getRoutinesForBatch = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const routines = await Routine.find({ batchId });
    res.status(200).json({ success: true, routines });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching routines", error });
  }
};

// update a routine status
export const archiveRoutine = async (req: Request, res: Response) => {
  try {
    const { routineId } = req.params;
    let updatedStatus = req.body.status || "archived";
    const routine = await Routine.findByIdAndUpdate(
      routineId,
      { status: updatedStatus },
      { new: true }
    );
    res.status(200).json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error archiving routine", error });
  }
};
