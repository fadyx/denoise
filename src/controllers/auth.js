import httpStatus from "http-status";

import catchAsync from "../middleware/catchAsyncErrors.js";

import { SuccessResponse } from "../utils/apiResponse.js";

import registerUseCase from "../usecases/auth/register.js";
import loginUseCase from "../usecases/auth/login.js";
import resetPasswordUseCase from "../usecases/auth/resetPassword.js";
import refreshTokenUseCase from "../usecases/auth/refreshToken.js";
import logoutUseCase from "../usecases/auth/logout.js";
import terminateUseCase from "../usecases/auth/terminate.js";

const register = catchAsync(async (req, res) => {
	const userDto = req.body;
	const payload = await registerUseCase(userDto);
	const response = SuccessResponse("registered user successfully.", payload);
	return res.status(httpStatus.CREATED).json(response);
});

const login = catchAsync(async (req, res) => {
	const { username, password } = req.body;
	const payload = await loginUseCase(username, password);
	const response = SuccessResponse("logged in user successfully.", payload);
	return res.status(200).json(response);
});

const resetPassword = catchAsync(async (req, res) => {
	const { username, password, newPassword } = req.body;
	await resetPasswordUseCase(username, password, newPassword);
	const response = SuccessResponse("reset password successfully.");
	return res.status(httpStatus.OK).json(response);
});

const refresh = catchAsync(async (req, res) => {
	const { refreshToken } = req;
	const { username } = req.decodedRefreshToken;
	const payload = await refreshTokenUseCase(username, refreshToken);
	const response = SuccessResponse("access token refreshed successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const logout = catchAsync(async (req, res, _next) => {
	const { refreshToken } = req;
	const { username } = req.decodedRefreshToken;
	await logoutUseCase(username, refreshToken);
	const response = SuccessResponse("logged out user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const terminate = catchAsync(async (req, res, _next) => {
	const { username, password } = req.body;

	await terminateUseCase(username, password);

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
