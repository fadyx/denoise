import httpError from "http-errors";
import _ from "lodash";

import Post from "../models/post.js";
import User from "../models/user.js";
import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";
import { SuccessResponse } from "../utils/apiResponse.js";
import validation from "../utils/validation.js";

const updateProfile = async (req, res) => {
	const { user } = req;
	const updates = req.body;

	_.assign(user, updates);
	await user.save();

	const payload = { user };
	const response = SuccessResponse("updated user successfully.", payload);
	return res.status(200).json(response);
};

const myProfile = catchAsync(async (req, res) => {
	const { user } = req;

	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(200).json(response);
});

const getUser = catchAsync(async (req, res) => {
	const { user } = req;
	const { username } = req.params;

	if (!validation.isValidUsername(username)) throw httpError(404, "user is not found.");

	if (user.username === username) {
		const payload = { user };
		const response = SuccessResponse("fetched user successfully.", payload);
		return res.status(200).json(response);
	}

	const requestedUser = await User.findByUsername(username);
	if (user.isBlockingOrBlockedBy(requestedUser._id)) throw httpError(404, "user is not found.");

	const isFollowed = user.followees.includes(requestedUser._id);

	const payload = { user: { ...requestedUser.toJSON(), isFollowed } };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(200).json(response);
});

const follow = catchAsync(async (req, res) => {
	const { user } = req;
	const followeeUsername = req.params.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(404, "user is not found.");
	if (user.username === followeeUsername) throw httpError(406, "cannot follow oneself.");

	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "user is not found.");

	user.followUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("followed user successfully.");
	return res.status(200).json(response);
});

const unfollow = catchAsync(async (req, res) => {
	const { user } = req;
	const followeeUsername = req.params.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(404, "user is not found.");
	if (user.username === followeeUsername) throw httpError(406, "cannot follow oneself.");

	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "user is not found.");

	user.unfollowUser(followee);
	const uow = async (session) => {
		await user.save({ session });
		await followee.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("unfollowed user successfully.");
	return res.status(200).json(response);
});

const block = catchAsync(async (req, res) => {
	const { user } = req;
	const blockedUsername = req.params.username;

	if (!validation.isValidUsername(blockedUsername)) throw httpError(404, "user is not found.");
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "user is not found.");

	user.blockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("blocked user successfully.");
	return res.status(200).json(response);
});

const unblock = catchAsync(async (req, res) => {
	const { user } = req;
	const blockedUsername = req.params.username;

	if (!validation.isValidUsername(blockedUsername)) throw httpError(404, "User not found.");

	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "user is not found.");

	user.unblockUser(blockedUser);
	const uow = async (session) => {
		await user.save({ session });
		await blockedUser.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("unblocked user successfully.");
	return res.status(200).json(response);
});

const myPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { lastPostId } = req.query;

	if (lastPostId && !validation.isValidObjectId(lastPostId)) throw httpError(400, "invalid pagination key.");
	const results = await Post.getUserPosts(user.id, lastPostId);
	const { posts, lastPage } = results;

	const nextLastPostId = posts[posts.length - 1]._id;

	const payload = { count: posts.length, nextLastPostId, posts, lastPage };
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(200).json(response);
});

const userPosts = catchAsync(async (req, res) => {
	const { user } = req;
	const { username } = req.params;
	const { lastPostId } = req.query;

	if (!validation.isValidUsername(username)) throw httpError(404, "User not found.");
	if (lastPostId && !validation.isValidObjectId(lastPostId)) throw httpError(400, "invalid pagination key.");
	const requestedUser = await User.findByUsername(username);
	if (!requestedUser || user.isBlockingOrBlockedBy(requestedUser._id)) throw httpError(404, "User was not found.");

	const results = await Post.getUserPosts(requestedUser.id, lastPostId);
	const { posts, lastPage } = results;

	const nextLastPostId = posts[posts.length - 1]._id;

	const payload = { count: posts.length, nextLastPostId, posts, lastPage };
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(200).json(response);
});

const clear = catchAsync(async (req, res) => {
	const { user } = req;

	await Post.updateMany(
		{ userId: user._id, deleted: false, deletedBy: user.username },
		{ deleted: true, deletedBy: user.username },
	);

	const response = SuccessResponse("cleared posts successfully.");
	return res.status(200).json(response);
});

const blocked = catchAsync(async (req, res) => {
	const { user } = req;

	await user.populateBlocked();

	const payload = { blocked: user.blocked };
	const response = SuccessResponse("fetched blocked users successfully.", payload);
	return res.status(200).json(response);
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
