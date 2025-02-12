import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  getPostDetails,
  getPosts,
  likePost,
  updatePost,
} from "../controllers/postController";

const router = express.Router();

/****************************Post Routes **************************/
router.post("/create", createPost); //{ author, content, image }
router.get("/", getPosts);
router.post("/like", likePost); //{ postId, userId }
router.post("/comment/:id", addComment); //{ user, text }
router.patch("/update/:id", updatePost); //{ userId, update }
router.get("/:id", getPostDetails);
router.delete("/delete/:postId", deletePost); //{ authorId, userId }

export default router;
