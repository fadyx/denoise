import httpError from "http-errors";
import _ from "lodash";

import Post from "../models/post.js";
import User from "../models/user.js";
import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

import validation from "../utils/validation.js";

const updateProfile = async (req, res, _next) => {
	const { user } = req;
	const updates = req.body;
	_.assign(user, updates);
	await user.save();
	return res.status(200).json({ user });
};

const myProfile = catchAsync(async (req, res) => {
	const { user } = req;
	return res.status(200).json(user);
});

const getUser = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { username } = req.params;
	if (!validation.isValidUsername(username)) return next(httpError(404, "User is not found."));
	if (user.username === username) return res.status(200).json(user);
	const requestedUser = await User.findByUsername(username);
	if (user.isBlockingOrBlockedBy(requestedUser._id)) return next(httpError(404, "User is not found."));
	const isFollowed = user.followees.includes(requestedUser._id);
	return res.status(200).json({ ...requestedUser.toJSON(), isFollowed });
});

const follow = catchAsync(async (req, res, next) => {
	const { user } = req;
	const followeeUsername = req.params.username;
	if (!validation.isValidUsername(followeeUsername)) return next(httpError(404, "User not found."));
	if (user.username === followeeUsername) return next(httpError(406, "Cannot follow oneself."));
	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "User not found.");
	user.followUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const unfollow = catchAsync(async (req, res, next) => {
	const { user } = req;
	const followeeUsername = req.params.username;
	if (!validation.isValidUsername(followeeUsername)) return next(httpError(404, "User not found."));
	if (user.username === followeeUsername) return next(httpError(406, "Cannot follow oneself."));
	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "User not found.");
	user.unfollowUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const block = catchAsync(async (req, res, next) => {
	const { user } = req;
	const blockedUsername = req.params.username;
	if (!validation.isValidUsername(blockedUsername)) return next(httpError(404, "User not found."));
	if (user.username === blockedUsername) return next(httpError(406, "Cannot block oneself."));
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "User not found.");
	user.blockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const unblock = catchAsync(async (req, res, next) => {
	const { user } = req;
	const blockedUsername = req.params.username;
	if (!validation.isValidUsername(blockedUsername)) return next(httpError(404, "User not found."));
	if (user.username === blockedUsername) return next(httpError(406, "Cannot unblock oneself."));
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "User not found.");
	user.unblockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const myPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { lastPostId } = req.query;
	if (lastPostId && !validation.isValidObjectId(lastPostId)) throw httpError(400, "Invalid pagination key.");
	const posts = await Post.getUserPosts(user.id, lastPostId);
	return res.status(200).json(posts);
});

const userPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { username } = req.params;
	const { lastPostId } = req.query;
	if (!validation.isValidUsername(username)) throw httpError(404, "User not found.");
	if (lastPostId && !validation.isValidObjectId(lastPostId)) throw httpError(400, "invalid pagination key.");
	const requestedUser = await User.findByUsername(username);
	if (!requestedUser || user.isBlockingOrBlockedBy(requestedUser._id)) throw httpError(404, "User was not found.");
	const posts = await Post.getUserPosts(requestedUser.id, lastPostId);
	return res.status(200).json(posts);
});

const clear = catchAsync(async (req, res) => {
	const { user } = req;
	const uow = async (session) => {
		await Post.updateMany({ userId: user.id, deleted: false }, { deleted: true }, { session });
		await session.commitTransaction();
		session.endSession();
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const blocked = catchAsync(async (req, res) => {
	const { user } = req;
	await user.populateBlocked();
	return res.status(200).json(user.blocked);
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
