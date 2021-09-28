import httpError from "http-errors";
import httpStatus from "http-status";
import _ from "lodash";

import Post from "../models/post.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";
import { SuccessResponse } from "../utils/apiResponse.js";
import validation from "../utils/validation.js";

const updateProfile = async (req, res) => {
	const { user } = req;
	const updates = req.body;

	_.assign(user.profile, updates);
	await user.save();

	const payload = { user };
	const response = SuccessResponse("updated user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
};

const myProfile = catchAsync(async (req, res) => {
	const { user } = req;

	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getUser = catchAsync(async (req, res) => {
	const { user } = req;
	const { username } = req.params;

	if (!validation.isValidUsername(username)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	if (user.username === username) {
		const payload = { user };
		const response = SuccessResponse("fetched user successfully.", payload);
		return res.status(httpStatus.OK).json(response);
	}

	const requestedUser = await User.findByUsername(username);
	if (user.isBlockingOrBlockedBy(requestedUser.username)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	const isFollowed = user.followees.includes(requestedUser.username);

	const payload = { user: { ...requestedUser.toJSON(), isFollowed } };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const follow = catchAsync(async (req, res) => {
	const { user } = req;
	const followeeUsername = req.params.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	if (user.username === followeeUsername) throw httpError(httpStatus.NOT_ACCEPTABLE, "cannot follow oneself.");

	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	user.followUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
		await Notification.pushStarNotification(followee.username, user.username);
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("followed user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unfollow = catchAsync(async (req, res) => {
	const { user } = req;
	const followeeUsername = req.params.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	if (user.username === followeeUsername) throw httpError(httpStatus.NOT_ACCEPTABLE, "cannot follow oneself.");

	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	user.unfollowUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("unfollowed user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const block = catchAsync(async (req, res) => {
	const { user } = req;
	const blockedUsername = req.params.username;

	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	user.blockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
		await Notification.unsubscribeUserFromUserPosts(user.username, blockedUser.username);
		await Notification.unsubscribeUserFromUserPosts(blockedUser.username, user.username);
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("blocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unblock = catchAsync(async (req, res) => {
	const { user } = req;
	const blockedUsername = req.params.username;

	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "User not found.");

	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	user.unblockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("unblocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const myPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { paginationKey } = req.query;

	if (paginationKey && !validation.isValidObjectId(paginationKey))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");
	const results = await Post.getUserPosts(user.username, paginationKey);
	const { posts, hasNextPage } = results;

	const nextPaginationKey = posts[posts.length - 1]._id;

	const payload = { count: posts.length, nextPaginationKey, posts, hasNextPage };
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const userPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { username } = req.params;
	const { paginationKey } = req.query;

	if (!validation.isValidUsername(username)) throw httpError(httpStatus.NOT_FOUND, "user was not found.");
	if (paginationKey && !validation.isValidObjectId(paginationKey))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");
	const requestedUser = await User.findByUsername(username);
	if (!requestedUser || user.isBlockingOrBlockedBy(requestedUser._id))
		throw httpError(httpStatus.NOT_FOUND, "user was not found.");

	const results = await Post.getUserPosts(requestedUser.username, paginationKey);
	const { posts, hasNextPage } = results;

	const nextPaginationKey = posts[posts.length - 1]._id;

	const payload = { count: posts.length, nextPaginationKey, posts, hasNextPage };
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const clear = catchAsync(async (req, res) => {
	const { user } = req;

	await Post.updateMany(
		{
			username: user.username,
			deleted: false,
			createdAt: { $gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS) },
		},
		{ deleted: true, deletedBy: user.username },
	);

	await Notification.deleteUserNotifications(user.username);

	const response = SuccessResponse("cleared posts successfully.");
	return res.status(httpStatus.OK).json(response);
});

const blocked = catchAsync(async (req, res) => {
	const { user } = req;

	const blockedUsers = await User.aggregate([
		{
			$match: {
				username: { $in: user.blocked },
			},
		},
		{ $project: { username: true, displayname: "$profile.displayname", _id: false } },
	]);

	const payload = { count: blockedUsers.length, blocked: blockedUsers };
	const response = SuccessResponse("fetched blocked users successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

export default {
	block,
	blocked,
	clear,
	follow,
	getUser,
	myPosts,
	myProfile,
	unblock,
	unfollow,
	updateProfile,
	userPosts,
};
