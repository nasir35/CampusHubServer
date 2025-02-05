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
exports.addComment = exports.likePost = exports.getPostDetails = exports.getPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, content, image } = req.body;
        const newPost = new Post_1.default({ userId, content, image });
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create post" });
    }
});
exports.createPost = createPost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.default.find().populate("userId", "name profilePic").sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch posts" });
    }
});
exports.getPosts = getPosts;
const getPostDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id).populate("user", "name profilePic");
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});
exports.getPostDetails = getPostDetails;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        const post = yield Post_1.default.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        }
        else {
            post.likes.push(userId);
        }
        yield post.save();
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to like post" });
    }
});
exports.likePost = likePost;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        const { user, text } = req.body;
        post.comments.push({ user, text });
        yield post.save();
        res.status(201).json(post.comments);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});
exports.addComment = addComment;
