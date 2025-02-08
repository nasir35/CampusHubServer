"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.addComment = exports.likePost = exports.getPostDetails = exports.getPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const User_1 = require("../models/User");
exports.createPost = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { author, content, image } = req.body;
        if (!author || !content) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const user = yield User_1.User.findById(author);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const newPost = new Post_1.default({ author, content, image });
        yield newPost.save();
        user.posts.push(newPost._id);
        yield user.save();
        res.status(201).json({ success: true, message: "Post Created Successfully!", data: newPost });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to create post" });
    }
}));
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.default.find().populate("author", "name profilePic").sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: `${posts.length} Posts found.`, data: posts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch posts" });
    }
});
exports.getPosts = getPosts;
const getPostDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id).populate("author", "name profilePic").populate({
            path: "comments", populate: {
                path: 'user',
                model: 'User',
                select: "name profilePic",
            }
        });
        if (!post)
            return res.status(404).json({ success: false, message: "Post not found" });
        res.status(200).json({ success: true, message: "Post found", data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error", data: error });
    }
});
exports.getPostDetails = getPostDetails;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        if (!postId || !userId) {
            return res.status(400).json({ success: false, message: "postId & userId are required!" }); // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not, return error message.  // Check if postId and userId are provided. If not
        }
        const post = yield Post_1.default.findById(postId);
        if (!post)
            return res.status(404).json({ success: false, message: "Post not found" });
        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => (id != null || (id === null || id === void 0 ? void 0 : id.toString()) !== userId));
        }
        else {
            post.likes.push(userId);
        }
        yield post.save();
        res.status(200).json({ success: true, message: "likes updated", data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to like post" });
    }
});
exports.likePost = likePost;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: "Post not found" });
        const { user, text } = req.body;
        post.comments.push({ user, text });
        yield post.save();
        res.status(201).json({ success: true, message: "Post saved successfully", data: post.comments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error", data: error });
    }
});
exports.addComment = addComment;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const { userId, update } = req.body;
    try {
        const post = yield Post_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (userId.toString() !== post.author._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update post" });
        }
        const updatedPost = yield Post_1.default.findByIdAndUpdate(postId, update, { new: true });
        if (!updatedPost)
            return res.status(404).json({ success: false, message: "Post not found" });
        res.status(200).json({ success: true, message: "Post updated successfully", data: updatedPost });
    }
    catch (error) {
        console.log("post update error", error);
        res.status(500).json({ success: false, message: "Failed to update post" });
    }
});
exports.updatePost = updatePost;
// write post delete controller
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const authorId = req.body.authorId;
        const userId = req.body.userId;
        const user = yield User_1.User.findById(userId);
        if (authorId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete post" });
        }
        const response = yield Post_1.default.findOneAndDelete({ _id: postId });
        user.posts = user.posts.filter((id) => id !== postId);
        user.save();
        return res.status(200).json({ success: true, message: "Post Delete Success" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Couldn't delete post" });
    }
});
exports.deletePost = deletePost;
