import httpError from "http-errors";
import httpStatus from "http-status";

import jwt from "../utils/jwt.js";

import catchAsync from "./catchAsyncErrors.js";

const auth = catchAsync(async (req, res, next) => {
	if (!req.headers.authorization || req.headers.authorization.split(" ").shift().toLowerCase() !== "bearer")
		throw httpError(httpStatus.UNAUTHORIZED, "unauthenticated.");
	const token = req.headers.authorization.split(" ").pop();
	const decodedAccessToken = jwt.verifyAccessToken(token);
	req.decodedAccessToken = decodedAccessToken;
	req.username = decodedAccessToken.username;
	return next();
});

const validateRefreshToken = catchAsync(async (req, res, next) => {
	if (!req.headers["x-refresh-token"]) throw httpError(httpStatus.UNAUTHORIZED, "unauthorized.");
	const token = req.headers["x-refresh-token"];
	const decodedRefreshToken = jwt.verifyRefreshToken(token);
	req.refreshToken = token;
	req.decodedRefreshToken = decodedRefreshToken;
	return next();
});

export { auth, validateRefreshToken };
