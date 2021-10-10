import _ from "lodash";
import httpStatus from "http-status";
import createError from "http-errors";

import User from "../models/user.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

import jwt from "../utils/jwt.js";

const registerUser = async (userDto, { session } = {}) => {
	const user = new User(userDto);
	await user.save({ session });
	return user;
};

const generateRefreshToken = async (user, { session } = {}) => {
	const payload = {
		username: user.username,
		role: user.role,
	};

	const token = jwt.signRefreshToken(payload);
	user.setToken(token);
	await user.save({ session });
	return token;
};

const generateAccessToken = async (user, refreshToken) => {
	if (user.token !== refreshToken) throw createError(400, "invalid token.");
	const payload = {
		username: user.username,
		role: user.role,
	};
	const token = jwt.signAccessToken(payload);
	return token;
};

const findByUsername = async (username, { session } = {}) => {
	const user = await User.findOne({ username }).session(session);
	if (!user || !user.isActive()) throw createError(404, "user is not found.");
	return user;
};

const findByCredentials = async (username, password, { session } = {}) => {
	const user = await findByUsername(username, { session });
	const isCorrectPassword = await user.checkPassword(password);
	if (!isCorrectPassword) throw createError(400, "invalid credentials.");
	return user;
};

const terminate = async (username, password, { session } = {}) => {
	const user = await findByCredentials(username, password, { session });
	user.terminate();
	await user.save({ session });
};

const resetPassword = async (username, oldPassword, newPassword, { session } = {}) => {
	const user = await findByCredentials(username, oldPassword, { session });
	user.setPassword(newPassword);
	await user.save({ session });
	return user;
};

const logout = async (username, refreshToken, { session } = {}) => {
	const user = await findByUsername(username, { session });
	if (user.token !== refreshToken) throw createError(401, "invalid token.");
	user.logout();
	await user.save({ session });
};

const findByUsernameAndUpdate = async (username, updates, { session } = {}) => {
	const user = await findByUsername(username, { session });
	_.assign(user.profile, updates);
	await user.save({ session });
	return user;
};

const blockUser = async (blockerUsername, blockedUsername, { session } = {}) => {
	if (blockerUsername === blockedUsername) throw createError(httpStatus.NOT_ACCEPTABLE, "cannot block oneself.");
	const uow = async (uowSession) => {
		const [blocker, blocked] = await Promise.all([
			findByUsername(blockerUsername, { session: uowSession }),
			findByUsername(blockedUsername, { session: uowSession }),
		]);
		blocker.blockUser(blocked);
		await Promise.all([blocker.save({ session: uowSession }), blocked.save({ session: uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const unblockUser = async (blockerUsername, blockedUsername, { session } = {}) => {
	if (blockerUsername === blockedUsername) throw createError(httpStatus.NOT_ACCEPTABLE, "cannot unblock oneself.");
	const uow = async (uowSession) => {
		const [blocker, blocked] = await Promise.all([
			findByUsername(blockerUsername, { session: uowSession }),
			findByUsername(blockedUsername, { session: uowSession }),
		]);
		blocker.unblockUser(blocked);
		await Promise.all([blocker.save({ session: uowSession }), blocked.save({ session: uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const followUser = async (followerUsername, followeeUsername, { session } = {}) => {
	if (followerUsername === followeeUsername) throw createError(httpStatus.NOT_ACCEPTABLE, "cannot follow oneself.");

	const uow = async (uowSession) => {
		const [follower, followee] = await Promise.all([
			findByUsername(followerUsername, { session: uowSession }),
			findByUsername(followeeUsername, { session: uowSession }),
		]);
		follower.followUser(followee);
		await Promise.all([follower.save({ session: uowSession }), followee.save({ session: uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const unfollowUser = async (followerUsername, followeeUsername, { session } = {}) => {
	if (followerUsername === followeeUsername) throw createError(httpStatus.NOT_ACCEPTABLE, "cannot unfollow oneself.");
	const uow = async (uowSession) => {
		const [follower, followee] = await Promise.all([
			findByUsername(followerUsername, { session: uowSession }),
			findByUsername(followeeUsername, { session: uowSession }),
		]);

		follower.unfollowUser(followee);
		await Promise.all([follower.save({ session: uowSession }), followee.save({ session: uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const getUserProfileAs = async (fetcherUsername, profileUsername) => {
	const requestedUser = await findByUsername(profileUsername);

	if (requestedUser.isBlockingOrBlockedBy(fetcherUsername))
		throw createError(httpStatus.NOT_FOUND, "user is not found.");

	const isFollowed = requestedUser.isFollowedBy(fetcherUsername);
	const profile = { ...requestedUser.toJSON(), isFollowed };
	return profile;
};

const getBlockedUsersFor = async (username) => {
	const blockedUsers = await User.aggregate([
		{
			$match: {
				username,
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "blocked",
				foreignField: "username",
				as: "blocked",
			},
		},
		{
			$unwind: {
				path: "$blocked",
				preserveNullAndEmptyArrays: false,
			},
		},
		{
			$project: {
				_id: false,
				username: true,
				displayname: "$profile.displayname",
			},
		},
	]);
	return blockedUsers;
};

export default {
	blockUser,
	findByCredentials,
	findByUsername,
	findByUsernameAndUpdate,
	followUser,
	generateAccessToken,
	generateRefreshToken,
	getBlockedUsersFor,
	getUserProfileAs,
	logout,
	registerUser,
	resetPassword,
	terminate,
	unblockUser,
	unfollowUser,
};
