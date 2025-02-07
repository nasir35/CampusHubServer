import { Request, Response } from "express";
import Post from "../models/Post";
import asyncHandler from "../middlewares/asyncHandler";
import { ApiResponse } from "../types/response";

export const createPost = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { author, content, image } = req.body;
    if (!author ||!content) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const newPost = new Post({ author, content, image });
    await newPost.save();
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
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false,message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
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
