import express from "express";

import auth from "../middleware/auth.js";
import validator from "../middleware/validators/post.js";
import controller from "../controllers/post.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.get("/newsfeed/:type", auth, controller.newsfeed);
router.post("/", auth, validator.createPost, controller.createPost);
router.get("/:postId", auth, controller.getPost);
router.delete("/:postId", auth, controller.deletePost);
router.post("/:postId/comments", auth, validator.createComment, controller.createComment);
router.delete("/:postId/comments/:commentId", auth, controller.deleteComment);
router.post("/:postId/love", auth, controller.lovePost);
router.post("/:postId/unlove", auth, controller.unlovePost);
router.get("/:postId/lovers", auth, controller.getPostLovers);

router.get("/:postId/comments", auth, controller.getPostComments);
router.post("/:postId/report", auth, controller.reportPost);
router.post("/:postId/comments/:commentId/report", auth, controller.reportComment);

export default router;
