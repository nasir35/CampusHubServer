import { Request, Response } from "express";
import Post from "../models/Post";
import asyncHandler from "../middlewares/asyncHandler";
import { ApiResponse } from "../types/response";
import { User } from "../models/User";
import mongoose from "mongoose";

export const createPost = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { author, content, image } = req.body;
    if (!author ||!content) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const newPost:any = new Post({ author, content, image });
    await newPost.save();
    user.posts.push(newPost._id);
    await user.save();
    res.status(201).json({ success: true, message: "Post Created Successfully!", data: newPost });
  } catch (error) {
    res.status(500).json({ success : false, message: "Failed to create post" });
  }
});

export const getPosts = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const posts = await Post.find().populate("author", "name profilePic").sort({ createdAt: -1 });
    res.status(200).json({success: true, message: `${posts.length} Posts found.`, data: posts});
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};


export const getPostDetails = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name profilePic").populate({
      path: "comments",populate: {
       path: 'user',
        model: 'User',
       select: "name profilePic",
     }
    });
    if (!post) return res.status(404).json({success : false, message: "Post not found" });

    res.status(200).json({success : true, message: "Post found" , data: post});
  } catch (error) {
    res.status(500).json({success:false, message: "Server Error", data : error });
  }
};

export const likePost = async (req: Request, res: Response<ApiResponse>) : Promise <any> => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) { 
      return res.status(400).json({ success: false, message: "postId & userId are required!" });  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false,message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id:any) => (id != null || id?.toString() !== userId));
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.status(200).json({ success: true, message: "likes updated", data: post });
  } catch (error) {
    res.status(500).json({success:false, message: "Failed to like post" });
  }
};

export const addComment = async (req: Request, res: Response<ApiResponse>): Promise<any> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({success:false, message: "Post not found" });

    const { user, text } = req.body;
    post.comments.push({ user, text });
    await post.save();

    res.status(201).json({ success: true, message: "Post saved successfully", data: post.comments });
  } catch (error) {
    res.status(500).json({success:false, message: "Server Error", data : error });
  }
};

export const updatePost = async (req:Request, res: Response<ApiResponse>) : Promise<any> => { 
  const postId = req.params.id;
  const { userId, update } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    if (userId.toString()!== post.author._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to update post" });
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });
    if (!updatedPost) return res.status(404).json({ success: false, message: "Post not found" });
    res.status(200).json({ success: true, message: "Post updated successfully", data: updatedPost });
  }
  catch (error) { 
    console.log("post update error", error);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
}

// write post delete controller
export const deletePost = async (req: Request, res: Response<ApiResponse>): Promise<any> => { 
  try {
    const postId = req.params.postId;
    const authorId = req.body.authorId;
    const userId = req.body.userId;
    const user:any = await User.findById(userId);
    if (authorId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete post" });
    }

    const response = await Post.findOneAndDelete({ _id: postId });
    user.posts = user.posts.filter((id:any) => id !== postId);
    user.save();
    return res.status(200).json({ success: true, message: "Post Delete Success" });
  } catch (error) {
    return res.status(500).json({success: false, message:"Couldn't delete post"})
  }

}
