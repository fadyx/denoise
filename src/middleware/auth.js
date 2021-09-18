import jwt from "jsonwebtoken";
import httpError from "http-errors";

import { roles } from "../constants/role.js";
import catchAsync from "./catchAsyncErrors.js";
import User from "../models/user.js";

const auth = catchAsync(async (req, res, next) => {
	if (!req.headers.authorization || req.headers.authorization.split(" ").shift() !== "Bearer")
		return next(httpError(401, "unauthenticated."));
	const token = req.headers.authorization.split(" ").pop();
	const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRETKEY);
	const user = await User.findActiveUserById(decodedToken.id);
	req.user = user;
	req.decodedToken = decodedToken;
	return next();
});

const checkRole = catchAsync(async (role) => {
	return async (req, res, next) => {
		if (!roles.includes(role) || req.decodedToken.role !== role) {
			return res.status(400).json({ error: `This route requires ${role} role.` });
		}
		return next();
	};
});

const validateRefreshToken = catchAsync(async (req, res, next) => {
	const refreshToken = req.headers["x-refresh-token"];
	if (!refreshToken) return next(httpError(401, "Unauthorized."));
	const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRETKEY);
	req.decodedRefreshToken = decodedRefreshToken;
	return next();
});

export { auth, checkRole, validateRefreshToken };
