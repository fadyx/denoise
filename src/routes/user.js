import express from "express";

import { auth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import controller from "../controllers/user.js";
import { userSchemas } from "../validations/index.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.get("/me", auth, controller.myProfile);
router.patch("/me", auth, validate(userSchemas.update), controller.updateProfile);
router.get("/:username", auth, controller.getUser);
router.post("/:username/follow", auth, controller.follow);
router.post("/:username/unfollow", auth, controller.unfollow);
router.post("/:username/block", auth, controller.block);
router.post("/:username/unblock", auth, controller.unblock);
router.get("/me/posts", auth, controller.myPosts);
router.get("/:username/posts", auth, controller.userPosts);
router.get("/me/blocked", auth, controller.blocked);
router.delete("/me/clear", auth, controller.clear);

export default router;
