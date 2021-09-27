import express from "express";

import { auth } from "../middleware/auth.js";
import controller from "../controllers/notification.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.get("/", auth, controller.getNotifications);
// router.post("/:id/read", controller.readNotification);
// router.post("/:id/read/all", controller.readAllNotification);

export default router;
