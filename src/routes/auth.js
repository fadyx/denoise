import express from "express";

import validate from "../middleware/validate.js";
import controller from "../controllers/auth.js";
import { authSchemas } from "../validations/index.js";
import { validateRefreshToken } from "../middleware/auth.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/register", validate(authSchemas.register), controller.register);
router.post("/login", validate(authSchemas.login), controller.login);
router.post("/refresh", validateRefreshToken, controller.refresh);
router.patch("/reset-password", validate(authSchemas.resetPassword), controller.resetPassword);
router.delete("/logout", validateRefreshToken, controller.logout);
router.delete("/terminate", validate(authSchemas.terminate), controller.terminate);

export default router;
