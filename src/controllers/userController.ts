import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler";
import mongoose, { Document } from "mongoose";

const JWT_SECRET = "sec4et"; // Change this to an environment variable

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

export const registerUser = async (req: RegisterUserRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, mobile, profilePic } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
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

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ token: "", user: {} as typeof User });
    }
};

// Login User
interface LoginUserRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

interface LoginUserResponse extends Response {
    json: (body: { token: string; user: Document | unknown }) => this;
}

export const loginUser = async (req: LoginUserRequest, res: LoginUserResponse): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({ token: "", user: null});

        return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
        res.status(400).json({ token: "", user: {} });
        return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (error) {
    const token = ""; // Initialize token with an empty string or appropriate value
    res.json({ token, user: {} });
  }
};

// Get User Profile

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email: email.toString() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userData = req.body;

  // Find user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update user fields dynamically
  Object.assign(user, userData);
  await user.save();

  res.json({ message: "Profile updated successfully", user });
});

// Follow a User
export const followUser = async (req: Request, res: Response):Promise<any> => {
  try {
    const { userToFollowId, currentUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userToFollowId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userToFollow = await User.findById(new mongoose.Types.ObjectId(userToFollowId));
    const currentUser = await User.findById(new mongoose.Types.ObjectId(currentUserId));
    if (userToFollowId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


// Unfollow a User
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userToUnfollow = await User.findById(req.params.userToUnfollowId);
    const currentUser = await User.findById(req.params.currentUserId);

    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: "User not found" });

    currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "User unfollowed" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get all Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
