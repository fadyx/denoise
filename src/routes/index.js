import express from "express";

import usersRouter from "./user.js";
import postsRouter from "./post.js";
import authRouter from "./auth.js";

const routers = express.Router({ caseSensitive: true, strict: true });

routers.use("/users", usersRouter);
routers.use("/posts", postsRouter);
routers.use("/auth", authRouter);

export default routers;
