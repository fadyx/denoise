import express from "express";

import { auth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { postSchemas, commentSchemas, reportSchemas, replySchemas } from "../validations/index.js";
import controller from "../controllers/post.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/", auth, validate(postSchemas.create), controller.createPost);
router.get("/:postId", auth, controller.getPost);
router.post("/:postId/like", auth, controller.likePost);
router.post("/:postId/unlike", auth, controller.unlikePost);
router.get("/:postId/likes", auth, controller.getPostLikes);
router.post("/:postId/comments", auth, validate(commentSchemas.create), controller.createComment);
router.delete("/:postId", auth, controller.deletePost);
router.get("/:postId/comments", auth, controller.getPostComments);
router.delete("/:postId/comments/:commentId", auth, controller.deleteComment);
router.get("/newsfeed/:type", auth, controller.newsfeed);
router.post("/:postId/report", auth, validate(reportSchemas.create), controller.reportPost);
router.post("/:postId/comments/:commentId/report", auth, validate(reportSchemas.create), controller.reportComment);
router.get("/:postId/comments/:commentId", auth, controller.getComment);
router.post("/:postId/comments/:commentId/replies", auth, validate(replySchemas.create), controller.createReply);
router.get("/:postId/comments/:commentId/replies", auth, controller.getCommentReplies);
router.delete("/:postId/comments/:commentId/replies/:replyId", auth, controller.deleteReply);
router.post(
	"/:postId/comments/:commentId/replies/:replyId/report",
	auth,
	validate(reportSchemas.create),
	controller.reportReply,
);

export default router;
