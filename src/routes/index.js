import express from "express";

import authRouter from "./auth.js";
import usersRouter from "./user.js";
import postsRouter from "./post.js";
import notificationsRouter from "./notification.js";

const routers = express.Router({ caseSensitive: true, strict: true });

routers.use("/auth", authRouter);
routers.use("/users", usersRouter);
routers.use("/posts", postsRouter);
routers.use("/notifications", notificationsRouter);

export default routers;
