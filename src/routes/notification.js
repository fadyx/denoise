import express from "express";

import { auth } from "../middleware/auth.js";
import controller from "../controllers/notification.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.get("/", auth, controller.getNotifications);
router.post("/:notificationId/read", auth, controller.readNotification);
router.post("/read-all", auth, controller.readAllNotification);

export default router;
