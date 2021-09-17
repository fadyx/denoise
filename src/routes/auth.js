import express from "express";

import validate from "../middleware/validate.js";
import controller from "../controllers/auth.js";
import { authSchemas } from "../validations/index.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/register", validate(authSchemas.register), controller.register);
router.post("/signin", validate(authSchemas.login), controller.signin);
router.post("/refresh", controller.refresh);
router.patch("/resetpassword", validate(authSchemas.resetPassword), controller.resetPassword);
router.delete("/signout", controller.signout);
router.delete("/terminate", validate(authSchemas.terminate), controller.terminate);

export default router;
