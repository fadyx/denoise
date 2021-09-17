import express from "express";

import validate from "../middleware/validate.js";
import controller from "../controllers/auth.js";
import { userSchemas } from "../validations/index.js";

const router = express.Router({ caseSensitive: true, strict: true });

router.post("/register", validate(userSchemas.signupRequestSchema), controller.register);
router.post("/signin", validate(userSchemas.loginRequestSchema), controller.signin);
router.post("/refresh", controller.refresh);
router.patch("/resetpassword", validate(userSchemas.resetPasswordRequestSchema), controller.resetPassword);
router.delete("/signout", controller.signout);
router.delete("/terminate", validate(userSchemas.terminateUserRequestSchema), controller.terminate);

export default router;
