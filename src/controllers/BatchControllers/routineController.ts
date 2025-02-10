import { Request, Response } from "express";
import { Routine } from "../../models/Batch/Routine";

export const createRoutine = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, batchId, createdBy } = req.body;

    const routine = new Routine({
      name,
      startDate,
      endDate,
      batchId,
      createdBy,
    });

    await routine.save();
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

// Archive a routine
export const archiveRoutine = async (req: Request, res: Response) => {
  try {
    const { routineId } = req.params;
    const routine = await Routine.findByIdAndUpdate(
      routineId,
      { status: "archived" },
      { new: true }
    );
    res.status(200).json({ success: true, routine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error archiving routine", error });
  }
};
