import express from "express";

import { auth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { postSchemas, commentSchemas } from "../validations/index.js";
import controller from "../controllers/post.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/", auth, validate(postSchemas.create), controller.createPost);
router.post("/:postId/comments", auth, validate(commentSchemas.create), controller.createComment);
router.get("/:postId", auth, controller.getPost);
router.delete("/:postId", auth, controller.deletePost);
router.delete("/:postId/comments/:commentId", auth, controller.deleteComment);
router.get("/newsfeed/:type", auth, controller.newsfeed);
router.post("/:postId/like", auth, controller.likePost);
router.post("/:postId/unlike", auth, controller.unlikePost);
router.get("/:postId/likes", auth, controller.getPostLikes);
router.get("/:postId/comments", auth, controller.getPostComments);
router.post("/:postId/report", auth, controller.reportPost);
router.post("/:postId/comments/:commentId/report", auth, controller.reportComment);

export default router;
