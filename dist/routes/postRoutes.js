"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const router = express_1.default.Router();
/****************************Post Routes **************************/
router.post("/create", postController_1.createPost); //{ author, content, image }
router.get("/", postController_1.getPosts);
router.post("/like", postController_1.likePost); //{ postId, userId }
router.post("/comment/:id", postController_1.addComment); //{ user, text }
router.patch("/update/:id", postController_1.updatePost); //{ userId, update }
router.get("/:id", postController_1.getPostDetails);
router.delete("/delete/:postId", postController_1.deletePost); //{ authorId, userId }
exports.default = router;
