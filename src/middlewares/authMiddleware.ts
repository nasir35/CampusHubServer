import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {User, IUser } from "../models/User"; // Ensure correct path

interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = (await User.findById(decoded.id).select("-password")) as IUser;

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
