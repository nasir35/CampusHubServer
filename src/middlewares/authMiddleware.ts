import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Store securely

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: string };
  }
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }
  else {
    try {
      // Verify token and extract user ID
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      req.user = decoded; // Attach user ID to request object
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
  }
};
