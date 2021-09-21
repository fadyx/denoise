import jwt from "jsonwebtoken";
import httpError from "http-errors";
import httpStatus from "http-status";

import User from "../models/user.js";
import Post from "../models/post.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

import { SuccessResponse } from "../utils/apiResponse.js";

const register = catchAsync(async (req, res, _next) => {
	const userDto = req.body;
	const user = new User(userDto);
	const refresh = await user.generateRefreshToken();
	const access = await user.generateAccessToken();
	await user.save();
	return res.status(201).json({ user, tokens: { refresh, access } });
});

const login = catchAsync(async (req, res, _next) => {
	const { username, password } = req.body;
	const user = await User.findByCredentials(username, password);
	const refresh = await user.generateRefreshToken();
	const access = await user.generateAccessToken();
	await user.save();
	return res.status(200).json({ user, tokens: { refresh, access } });
});

const resetPassword = catchAsync(async (req, res, _next) => {
	const { username, password, newPassword } = req.body;
	const user = await User.findByCredentials(username, password);
	user.password = newPassword;
	await user.save();
	return res.status(200).json();
});

const refresh = catchAsync(async (req, res, _next) => {
	const { user } = req;
	const refreshToken = req.headers["x-refresh-token"];
	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "Invalid token.");
	const access = user.generateAccessToken();
	const data = { tokens: { access } };
	const response = SuccessResponse("access token refreshed successfully.", data);
	return res.status(200).json(response);
});

const logout = catchAsync(async (req, res, _next) => {
	const refreshToken = req.headers["x-refresh-token"];
	if (!refreshToken) return res.status(403).json({ message: "Refresh token is required." });
	const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
	const user = await User.findByUsername(decodedToken.username);
	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "Invalid token.");
	user.token = null;
	await user.save();
	return res.status(200).json();
});

const terminate = catchAsync(async (req, res, _next) => {
	const { username, password } = req.body;
	const uow = async (session) => {
		const user = await User.findByCredentials(username, password);
		user.deleted = true;
		user.token = null;
		await user.save({ session });
		await Post.updateMany({ userId: user._id, deleted: false, deletedBy: user.username }, { deleted: true }).session(
			session,
		);
	};
	await RunUnitOfWork(uow);
	return res.status(200).send();
});

export default {
	register,
	login,
	logout,
	terminate,
	resetPassword,
	refresh,
};
