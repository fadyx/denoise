import jwt from "jsonwebtoken";
import httpError from "http-errors";
import httpStatus from "http-status";

import catchAsync from "./catchAsyncErrors.js";
import User from "../models/user.js";

const auth = catchAsync(async (req, res, next) => {
	if (!req.headers.authorization || req.headers.authorization.split(" ").shift().toLowerCase() !== "bearer")
		throw httpError(httpStatus.UNAUTHORIZED, "unauthenticated.");
	const token = req.headers.authorization.split(" ").pop();
	const decodedAccessToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
	const user = await User.findActiveUserByUsername(decodedAccessToken.username);
	req.user = user;
	req.decodedAccessToken = decodedAccessToken;
	return next();
});

const validateRefreshToken = catchAsync(async (req, res, next) => {
	if (!req.headers["x-refresh-token"]) throw httpError(httpStatus.UNAUTHORIZED, "Unauthorized.");
	const token = req.headers["x-refresh-token"];
	const decodedRefreshToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
	const user = await User.findActiveUserByUsername(decodedRefreshToken.username);
	req.user = user;
	req.refreshToken = token;
	req.decodedRefreshToken = decodedRefreshToken;
	return next();
});

export { auth, validateRefreshToken };
