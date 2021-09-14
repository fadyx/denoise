import express from "express";

import auth from "../middleware/auth.js";
import validator from "../middleware/validators/user.js";
import controller from "../controllers/user.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/signup", validator.signup, controller.signup);
router.post("/login", validator.login, controller.login);
router.patch("/resetpassword", validator.resetPassword, controller.resetPassword);
router.delete("/logout", auth, controller.logout);
router.get("/me", auth, controller.myProfile);
router.patch("/me", auth, validator.updateProfile, controller.updateProfile);
router.get("/:userId", auth, controller.getUser);
router.post("/:userId/follow", auth, controller.follow);
router.post("/:userId/unfollow", auth, controller.unfollow);
router.post("/:userId/block", auth, controller.block);
router.post("/:userId/unblock", auth, controller.unblock);
router.post("/:userId/blockdevice", auth, controller.blockDevice);
router.get("/me/posts", auth, controller.myPosts);
router.get("/:userId/posts", auth, controller.userPosts);
router.get("/me/blocked", auth, controller.blocked);
router.delete("/me/terminate", auth, validator.terminateUser, controller.terminate);
router.delete("/me/clear", auth, controller.clear);

export default router;
