import express from "express";
import { addComment, createPost, getPostDetails, getPosts, likePost } from "../controllers/postController";

const router = express.Router();

router.post("/create", createPost);
router.get("/", getPosts);
router.post("/like", likePost);
router.get("/details/:id", getPostDetails);
router.post("/comment/:id", addComment);

export default router;
