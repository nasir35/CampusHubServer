import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler";
import mongoose from "mongoose";
import { ApiResponse } from "../types/response";

const JWT_SECRET:string = process.env.JWT_SECRET || "secret";

// Register User
interface RegisterUserRequest extends Request {
    body: {
        name: string;
        email: string;
        password: string;
        mobile: string;
        profilePic: string;
    };
}

export const registerUser = async (req: RegisterUserRequest, res: Response<ApiResponse>): Promise<void> => {
    try {
        const { name, email, password, mobile, profilePic } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({success:false, message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            profilePic,
        });
        await user.save();

        res.status(201).json({success:false, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({success : false, message : "failed user registration", data : error});
    }
};

export const loginUser = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({success:false, message: "No user found with this email." });

        return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
        res.status(400).json({ success: false, message: "Password mismatch." });
        return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ success: true, message: "login success", data: { token, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error"});
  }
};

// Get User Profile

export const getUserProfile = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({success:false,  message: "Email is required" });
  }

  const user = await User.findOne({ email: email.toString() });
  if (!user) {
    return res.status(404).json({success:false, message: "User not found" });
  }

  res.status(200).json({success:true, message:"user found successfully", data: user});
});
export const getUserById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({success:false,  message: "User Id is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({success:false, message: "User not found" });
  }

  res.status(200).json({success:true, message:"user found successfully", data: user});
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { userId } = req.params;
  const userData = req.body;

  // Find user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success:false, message: "User not found" });
  }

  // Update user fields dynamically
  Object.assign(user, userData);
  await user.save();

  res.status(200).json({success:true, message: "Profile updated successfully", data: user });
});

// Follow a User
export const followUser = async (req: Request, res: Response<ApiResponse>):Promise<any> => {
  try {
    const { userToFollowId, currentUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userToFollowId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({success:false, message: "Invalid user ID" });
    }

    const userToFollow:any = await User.findById(new mongoose.Types.ObjectId(userToFollowId));
    const currentUser:any = await User.findById(new mongoose.Types.ObjectId(currentUserId));
    if (userToFollowId === currentUserId) {
      return res.status(400).json({success:false, message: "You cannot follow yourself" });
    }

    if (!userToFollow || !currentUser) {
      return res.status(404).json({success:false, message: "User not found" });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ success: false, message: "You are already following this user" });
    }

    currentUser.following.push(userToFollow._id as mongoose.Types.ObjectId);
    userToFollow.followers.push(currentUser._id as mongoose.Types.ObjectId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({success:true, message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({success:false, message: (error as Error).message });
  }
};


// Unfollow a User
export const unfollowUser = async (req: Request, res: Response<ApiResponse>) : Promise<any> => {
  try {
    const userToUnfollow = await User.findById(req.params.userToUnfollowId);
    const currentUser = await User.findById(req.params.currentUserId);

    if (!userToUnfollow || !currentUser) return res.status(404).json({success:false, message: "User not found" });

    currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id);
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({success: true, message: "User unfollowed" });
  } catch (error) {
    res.status(500).json({success: false, message: (error as Error).message });
  }
};

// Get all Users
export const getAllUsers = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({success:true, message:`${users.length} users found`, data:users});
  } catch (error) {
    res.status(500).json({success:false, message: (error as Error).message });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response<ApiResponse>) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({success:true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({success:false, message: (error as Error).message });
  }
};
