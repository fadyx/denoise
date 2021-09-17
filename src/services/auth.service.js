import httpError from "http-errors";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import userService from "./user.service.js";

const loginUserWithUsernameAndPassword = async (username, password) => {
	const user = await userService.getUserByUsername(username);
	if (!user || user.deleted || user.banned || !(await user.checkPassword(password)))
		throw httpError(httpStatus.UNAUTHORIZED, "Incorrect credentials.");
	return user;
};

const generateAccessToken = async (refreshToken) => {
	const decodedToken = jwt.verify(refreshToken, process.env.JWTSECRETKEY);
	const user = await userService.getUserByUsername(decodedToken.username);
	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "Invalid token.");
	const accessToken = user.generateAccessToken();
	return accessToken;
};

const generateTokens = async (user) => {
	const refresh = await user.generateRefreshToken();
	const access = await user.generateAccessToken();
	return { refresh, access };
};

const revokeToken = async (refreshToken) => {
	const decodedToken = jwt.verify(refreshToken, process.env.JWTSECRETKEY);
	const user = await userService.getUserByUsername(decodedToken.username);
	if (user.token !== refreshToken) throw httpError(httpStatus.UNAUTHORIZED, "Invalid token.");
	user.token = null;
	await user.save();
};

export default {
	loginUserWithUsernameAndPassword,
	generateAccessToken,
	revokeToken,
	generateTokens,
};
