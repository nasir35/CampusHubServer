import { Request, Response } from "express";
import Post from "../models/Post";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { userId, content, image } = req.body;
    const newPost = new Post({ userId, content, image });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate("userId", "name profilePic").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};


export const getPostDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const likePost = async (req: Request, res: Response) : Promise <any> => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to like post" });
  }
};

export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { user, text } = req.body;
    post.comments.push({ user, text });
    await post.save();

    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
