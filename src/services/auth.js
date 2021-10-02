import createError from "http-errors";

import User from "../models/user.js";

import jwt from "../utils/jwt.js";

const register = async ({ userDto }, { session }) => {
	const user = new User(userDto);
	await user.save({ session });
	return user;
};

const generateRefreshToken = async ({ user }, { session }) => {
	const payload = {
		username: user.username,
		role: user.role,
	};
	const token = jwt.signRefreshToken(payload);
	user.setRefreshToken(token);
	await user.save({ session });
	return token;
};

const generateAccessToken = async ({ user }) => {
	const payload = {
		username: user.username,
		role: user.role,
	};
	const token = jwt.signAccessToken(payload);
	return token;
};

const login = async ({ username, password }, { session }) => {
	const user = await User.findOne({ username }).session(session);
	if (!user || user.inactive || user.banned) throw createError(404, "user is not found.");
	const isCorrectPassword = await user.checkPassword(password);
	if (!isCorrectPassword) throw createError("invalid credentials.");
	return user;
};

const terminate = async ({ username, password }, { session }) => {
	const user = await login({ username, password }, { session });
	user.terminate();
	user.save({ session });
};

const resetPassword = async ({ user, newPassword }, { session }) => {
	user.setPassword(newPassword);
	await user.save({ session });
};

export default { register, terminate, generateRefreshToken, generateAccessToken, login, resetPassword };
