import httpError from "http-errors";
import _ from "lodash";

import Post from "../models/post.js";
import User from "../models/user.js";
import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";

import text from "../utils/text.js";

const updateProfile = async (req, res, _next) => {
	const { user } = req;
	const updates = req.body;
	_.assign(user, updates);
	await user.save();
	const accessToken = user.generateAccessToken();
	return res.status(200).json({ user, tokens: { access: accessToken } });
};

const myProfile = catchAsync(async (req, res) => {
	const { user } = req;
	return res.status(200).json(user);
});

const getUser = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { username } = req.params;
	if (!text.isValidUsername(username)) return next(httpError(404, "User is not found."));
	if (user.username === username) return res.status(200).json(user);
	const requestedUser = await User.findByUsername(username);
	if (user.isBlockingOrBlockedBy(requestedUser)) return next(httpError(404, "user is not found."));
	user.isFollowed = user.followees.includes(requestedUser._id);
	return res.status(200).json({ ...requestedUser.toJSON() });
});

const follow = catchAsync(async (req, res, next) => {
	const followerUsername = req.decodedToken.username;
	const followeeUsername = req.params.username;

	if (!text.isValidUsername(followeeUsername)) return next(httpError(404, "User not found."));
	if (followerUsername === followeeUsername) return next(httpError(406, "Cannot follow oneself."));

	const follower = await User.findByUsername(followerUsername);
	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "User not found.");
	follower.followUser(followee);

	const uow = async (session) => {
		await follower.save({ session });
		await followee.save({ session });
	};

	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const unfollow = catchAsync(async (req, res, next) => {
	const followerUsername = req.decodedToken.username;
	const followeeUsername = req.params.username;

	if (!text.isValidUsername(followeeUsername)) return next(httpError(404, "User not found."));
	if (followerUsername === followeeUsername) return next(httpError(406, "Cannot follow oneself."));

	const follower = await User.findByUsername(followerUsername);
	const followee = await User.findByUsername(followeeUsername);
	if (!followee) throw httpError(404, "User not found.");
	follower.unfollowUser(followee);

	const uow = async (session) => {
		await follower.save({ session });
		await followee.save({ session });
	};

	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const block = catchAsync(async (req, res, next) => {
	const blockerUsername = req.decodedToken.username;
	const blockedUsername = req.params.username;

	if (!text.isValidUsername(blockedUsername)) return next(httpError(404, "User not found."));
	if (blockerUsername === blockedUsername) return next(httpError(406, "Cannot block oneself."));

	const blockerUser = await User.findByUsername(blockerUsername);
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "User not found.");
	blockerUser.blockUser(blockedUser);

	const uow = async (session) => {
		await blockerUser.save({ session });
		await blockedUser.save({ session });
	};

	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const unblock = catchAsync(async (req, res, next) => {
	const blockerUsername = req.decodedToken.username;
	const blockedUsername = req.params.username;

	if (!text.isValidUsername(blockedUsername)) return next(httpError(404, "User not found."));
	if (blockerUsername === blockedUsername) return next(httpError(406, "Cannot unblock oneself."));

	const blockerUser = await User.findByUsername(blockerUsername);
	const blockedUser = await User.findByUsername(blockedUsername);
	if (!blockedUser) throw httpError(404, "User not found.");
	blockerUser.unblockUser(blockedUser);

	const uow = async (session) => {
		await blockerUser.save({ session });
		await blockedUser.save({ session });
	};

	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const myPosts = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { lastPostId } = req.query;

	if (lastPostId && !isObjectId(lastPostId)) return next(httpError(400, "invalid pagination key."));

	try {
		const posts = await Post.getUserPosts(user._id, lastPostId);
		return res.status(200).json(posts);
	} catch (error) {
		return next(httpError(500));
	}
});

const userPosts = catchAsync(async (req, res, next) => {
	const { userId } = req.params;
	const { lastPostId } = req.query;

	if (!isObjectId(userId)) {
		return httpError(404, "user not found.");
	}

	if (lastPostId && !isObjectId(lastPostId)) {
		return next(httpError(400, "invalid pagination key."));
	}

	try {
		const user = await User.findById(userId);

		if (!user || !(await user.isCommunicableWith(req.user))) {
			return next(httpError(404, "user was not found."));
		}

		const posts = await Post.getUserPosts(user._id, lastPostId);
		return res.status(200).json(posts);
	} catch (error) {
		return next(httpError(500));
	}
});

const clear = catchAsync(async (req, res, next) => {
	const { user } = req;

	try {
		const session = await User.startSession();
		session.startTransaction();
		try {
			await Post.updateMany({ userId: user._id, deleted: false }, { deleted: true }, { session });
			await session.commitTransaction();
			session.endSession();
			return res.status(200).json();
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			return next(error);
		}
	} catch (error) {
		return next(error);
	}
});

const blocked = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.decodedToken.id);
	await user.populateBlocked();
	return res.status(200).json(user.blocked);
});

export default {
	myProfile,
	updateProfile,
	getUser,
	userPosts,
	myPosts,
	follow,
	unfollow,
	block,
	unblock,
	clear,
	blocked,
};
