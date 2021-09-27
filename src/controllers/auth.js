import httpError from "http-errors";
import httpStatus from "http-status";

import User from "../models/user.js";
import Post from "../models/post.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

import { SuccessResponse } from "../utils/apiResponse.js";

const register = catchAsync(async (req, res) => {
	const userDto = req.body;

	const user = new User(userDto);
	const refresh = user.generateRefreshToken();
	const access = user.generateAccessToken();
	await user.save();

	const payload = { user, tokens: { refresh, access } };
	const response = SuccessResponse("registered user successfully.", payload);
	return res.status(httpStatus.CREATED).json(response);
});

const login = catchAsync(async (req, res) => {
	const { username, password } = req.body;

	const user = await User.findByCredentials(username, password);
	const refresh = user.generateRefreshToken();
	const access = user.generateAccessToken();
	await user.save();

	const payload = { user, tokens: { refresh, access } };
	const response = SuccessResponse("logged in user successfully.", payload);
	return res.status(200).json(response);
});

const resetPassword = catchAsync(async (req, res) => {
	const { username, password, newPassword } = req.body;

	const user = await User.findByCredentials(username, password);
	user.password = newPassword;
	await user.save();

	const response = SuccessResponse("reset password successfully.");
	return res.status(httpStatus.OK).json(response);
});

const refresh = catchAsync(async (req, res) => {
	const { user, refreshToken } = req;

	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "invalid token.");
	const access = user.generateAccessToken();

	const payload = { tokens: { access } };
	const response = SuccessResponse("access token refreshed successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const logout = catchAsync(async (req, res, _next) => {
	const { user, refreshToken } = req;

	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "invalid token.");
	user.token = null;
	await user.save();

	const response = SuccessResponse("logged out user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const terminate = catchAsync(async (req, res, _next) => {
	const { username, password } = req.body;

	const uow = async (session) => {
		const user = await User.findByCredentials(username, password);
		user.inactive = true;
		user.token = null;
		await user.save({ session });
		await Post.updateMany(
			{
				username: user.username,
				deleted: false,
				createdAt: { $gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS) },
			},
			{ deleted: true, deletedBy: user.username },
			{ session },
		);
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("terminated user successfully.");
	return res.status(httpStatus.OK).json(response);
});

export default {
	register,
	login,
	logout,
	terminate,
	resetPassword,
	refresh,
};
