import _ from "lodash";
import httpStatus from "http-status";
import createError from "http-errors";

import User from "../models/user.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

const findActiveUserByUsername = async ({ username }, { session }) => {
	const user = await User.findOne({ username }).session(session);
	if (!user || user.inactive || user.banned) throw createError(404, "user is not found.");
	return user;
};

const findActiveUserByUsernameAs = async ({ username, asUsername }, { session }) => {
	const user = await User.findOne({ username }).session(session);
	if (!user || user.inactive || user.banned || user.isBlockingOrBlockedBy(asUsername))
		throw createError(404, "user is not found.");
	return user;
};

const findActiveUserByUsernameAndUpdate = async ({ username, updates }, { session }) => {
	const user = await findActiveUserByUsername({ username }, { session });
	_.assign(user.profile, updates);
	await user.save({ session });
};

const blockUser = async ({ blockerUsername, blockedUsername }, { session }) => {
	const uow = async (uowSession) => {
		const [blocker, blocked] = await Promise.all([
			findActiveUserByUsername({ username: blockerUsername }, { uowSession }),
			findActiveUserByUsername({ username: blockedUsername }, { uowSession }),
		]);
		if (blocker.isBlockingOrBlockedBy(blocked)) throw createError(httpStatus.NOT_FOUND, "user is not found.");
		blocker.blockUser(blocked);
		await Promise.all([blocker.save({ uowSession }), blocked.save({ uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const unblockUser = async ({ blockerUsername, blockedUsername }, { session }) => {
	const uow = async (uowSession) => {
		const [blocker, blocked] = await Promise.all([
			findActiveUserByUsername({ username: blockerUsername }, { uowSession }),
			findActiveUserByUsername({ username: blockedUsername }, { uowSession }),
		]);
		if (!blocker.isBlockingOrBlockedBy(blocked)) throw createError(httpStatus.NOT_FOUND, "user is not found.");
		blocker.unblockUser(blocked);
		await Promise.all([blocker.save({ uowSession }), blocked.save({ uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const followUser = async ({ followerUsername, followeeUsername }, { session }) => {
	const uow = async (uowSession) => {
		const [follower, followee] = await Promise.all([
			findActiveUserByUsername({ username: followerUsername }, { uowSession }),
			findActiveUserByUsername({ username: followeeUsername }, { uowSession }),
		]);

		if (follower.isBlockingOrBlockedBy(followeeUsername))
			throw createError(httpStatus.NOT_FOUND, "user is not found.");
		follower.followUser(followee);
		await Promise.all([follower.save({ uowSession }), followee.save({ uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const unfollowUser = async ({ followerUsername, followeeUsername }, { session }) => {
	const uow = async (uowSession) => {
		const [follower, followee] = await Promise.all([
			findActiveUserByUsername({ username: followerUsername }, { uowSession }),
			findActiveUserByUsername({ username: followeeUsername }, { uowSession }),
		]);

		if (follower.isBlockingOrBlockedBy(followeeUsername))
			throw createError(httpStatus.NOT_FOUND, "user is not found.");

		follower.unfollowUser(followee);

		await Promise.all([follower.save({ uowSession }), followee.save({ uowSession })]);
	};

	if (!session) await RunUnitOfWork(uow);
	else await uow(session);
};

const getUserProfileAs = async (profileFetcherUsername, profileUsername) => {
	const [user, requestedUser] = await Promise.all([
		findActiveUserByUsername({ username: profileFetcherUsername }),
		findActiveUserByUsername({ username: profileUsername }),
	]);

	if (user.isBlockingOrBlockedBy(requestedUser.username))
		throw createError(httpStatus.NOT_FOUND, "user is not found.");

	const isFollowed = user.followees.includes(requestedUser.username);
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
	getBlockedUsersFor,
	findActiveUserByUsername,
	findActiveUserByUsernameAs,
	findActiveUserByUsernameAndUpdate,
	blockUser,
	unblockUser,
	followUser,
	unfollowUser,
	getUserProfileAs,
};
