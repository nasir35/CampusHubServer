import express from "express";
import { addComment, createPost, getPostDetails, getPosts, likePost, updatePost } from "../controllers/postController";

const router = express.Router();

router.post("/create", createPost); //{ author, content, image }
router.get("/", getPosts);
router.post("/like", likePost); //{ postId, userId }
router.get("/:id", getPostDetails); 
router.post("/comment/:id", addComment); //{ user, text }
router.patch("/update/:id", updatePost); //{ userId, update }
export default router;
