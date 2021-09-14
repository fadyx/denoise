import createError from "http-errors";

import Post from "../models/post.js";
import User from "../models/user.js";

import isObjectId from "../utils/isObjectId.js";

const signup = async (req, res, next) => {
	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const newUserInfo = req.validRequest;
			const newUser = new User(newUserInfo);
			await newUser.$session(session);
			const token = await newUser.generateAuthToken();
			await newUser.save();

			const blockingUsers = await User.find({ blockedUUIDS: newUser.uuid }).session(session).exec();

			if (blockingUsers) {
				const blocking = [];
				const saving = [];

				blockingUsers.forEach((blockingUser) => {
					blocking.push(blockingUser.uuidBlockUser(newUser));
					saving.push(blockingUser.save());
				});

				await Promise.all(blocking);
				await Promise.all(saving);
			}

			await session.commitTransaction();
			session.endSession();

			return res.header("x-auth-token", token).status(201).json(newUser);
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			return next(error);
		}
	} catch (error) {
		return next(error);
	}
};

const login = async (req, res, next) => {
	const credentials = req.validRequest;
	try {
		const user = await User.findByCredentials(credentials.username, credentials.password);
		const token = await user.generateAuthToken();
		await user.save();
		return res.header("x-auth-token", token).status(200).json(user);
	} catch (error) {
		return next(error);
	}
};

const resetPassword = async (req, res, next) => {
	const validatedRequestBody = req.validRequest;
	try {
		const user = await User.findByCredentials(validatedRequestBody.username, validatedRequestBody.password);
		user.password = validatedRequestBody.newpassword;
		const token = await user.generateAuthToken();
		await user.save();
		return res.header("x-auth-token", token).status(200).json();
	} catch (error) {
		return next(error);
	}
};

const logout = async (req, res, next) => {
	const { user } = req;
	try {
		await user.logout();
		await user.save();
		return res.status(200).json();
	} catch (error) {
		return next(error);
	}
};

const updateProfile = async (req, res, next) => {
	const { user } = req;
	const validUpdates = req.validRequest;

	try {
		await user.updateProfile(validUpdates);
		await user.save();
		return res.status(200).json(user);
	} catch (error) {
		return next(error);
	}
};

const myProfile = async (req, res) => {
	const { user } = req;
	return res.status(200).json(user);
};

const getUser = async (req, res, next) => {
	const { user } = req;
	const { userId } = req.params;

	if (!isObjectId(userId)) return next(createError(404, "user is not found."));
	if (user._id.equals(userId)) return res.status(200).json(user);

	try {
		const otherUser = await User.findById(userId);
		if (!otherUser || !(await user.isCommunicableWith(otherUser)))
			return next(createError(404, "user is not found."));

		const isFollowed = user._id.equals(userId) ? null : user.followees.includes(userId);

		return res.status(200).json({ ...otherUser.toJSON(), isFollowed });
	} catch (error) {
		return next(error);
	}
};

const follow = async (req, res, next) => {
	const followerId = req.user._id.toString();
	const followeeId = req.params.userId;

	if (!isObjectId(followeeId)) return next(createError(404, "user not found."));

	if (followerId === followeeId) return next(createError(406, "cannot follow oneself."));

	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const follower = await User.findById(followerId).session(session).exec();
			const followee = await User.findById(followeeId).session(session).exec();

			if (!followee) throw createError(404, "user not found.");

			await follower.followUser(followee);

			await follower.save();
			await followee.save();

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
};

const unfollow = async (req, res, next) => {
	const followerId = req.user._id.toString();
	const followeeId = req.params.userId;

	if (!isObjectId(followeeId)) return next(createError(404, "user not found."));

	if (followerId === followeeId) return next(createError(406, "cannot unfollow oneself."));

	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const follower = await User.findById(followerId).session(session).exec();
			const followee = await User.findById(followeeId).session(session).exec();

			if (!followee) {
				throw createError(404, "user not found.");
			}

			await follower.unfollowUser(followee);

			await follower.save();
			await followee.save();

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
};

const block = async (req, res, next) => {
	const userId = req.user._id.toString();
	const otherUserId = req.params.userId;

	if (!isObjectId(otherUserId)) return next(createError(404, "user not found."));

	if (userId === otherUserId) return next(createError(406, "cannot block oneself."));

	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const user = await User.findById(userId).session(session).exec();
			const otherUser = await User.findById(otherUserId).session(session).exec();

			if (!otherUser) throw createError(404, "user not found.");
			await user.blockUser(otherUser);

			await user.save();
			await otherUser.save();

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
};

const unblock = async (req, res, next) => {
	const userId = req.user._id.toString();
	const otherUserId = req.params.userId;

	if (!isObjectId(otherUserId)) {
		return next(createError(404, "user not found."));
	}

	if (userId === otherUserId) {
		return next(createError(406, "cannot unblock oneself."));
	}

	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const user = await User.findById(userId).session(session).exec();
			const otherUser = await User.findById(otherUserId).session(session).exec();

			if (!otherUser) throw createError(404, "user not found.");

			await user.unblockUser(otherUser);

			await user.save();
			await otherUser.save();

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
};

const blockDevice = async (req, res, next) => {
	const userId = req.user._id.toString();
	const otherUserId = req.params.userId;

	if (!isObjectId(otherUserId)) return next(createError(404, "user not found."));

	if (userId === otherUserId) return next(createError(406, "cannot block oneself."));

	try {
		const session = await User.startSession();
		session.startTransaction();

		try {
			const user = await User.findById(userId).session(session).exec();
			const otherUser = await User.findById(otherUserId).session(session).exec();
			if (!otherUser || (await otherUser.isBlocking(user))) throw createError(404, "user not found.");
			if (await user.isBlocking(otherUser)) throw createError(406, "user is already blocked.");

			if (user.uuid === otherUser.uuid) {
				await user.blockUser(otherUser);
			} else {
				const usersToBlock = await User.find({ uuid: otherUser.uuid }).session(session).exec();
				if (usersToBlock) {
					const blocking = [];
					const saving = [];
					usersToBlock.forEach((other) => {
						blocking.push(user.uuidBlockUser(other));
						saving.push(other.save());
					});
					await Promise.all(blocking);
					await Promise.all(saving);
				}
				user.blockedUUIDS.addToSet(otherUser.uuid);
			}

			await user.save();
			await otherUser.save();

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
};

const myPosts = async (req, res, next) => {
	const { user } = req;
	const { lastPostId } = req.query;

	if (lastPostId && !isObjectId(lastPostId)) return next(createError(400, "invalid pagination key."));

	try {
		const posts = await Post.getUserPosts(user._id, lastPostId);
		return res.status(200).json(posts);
	} catch (error) {
		return next(createError(500));
	}
};

const userPosts = async (req, res, next) => {
	const { userId } = req.params;
	const { lastPostId } = req.query;

	if (!isObjectId(userId)) {
		return createError(404, "user not found.");
	}

	if (lastPostId && !isObjectId(lastPostId)) {
		return next(createError(400, "invalid pagination key."));
	}

	try {
		const user = await User.findById(userId);

		if (!user || !(await user.isCommunicableWith(req.user))) {
			return next(createError(404, "user was not found."));
		}

		const posts = await Post.getUserPosts(user._id, lastPostId);
		return res.status(200).json(posts);
	} catch (error) {
		return next(createError(500));
	}
};

const terminate = async (req, res, next) => {
	const { user } = req;

	try {
		const session = await User.startSession();
		session.startTransaction();
		const validRequestBody = req.validRequest;
		try {
			const isPasswordValid = await user.checkPassword(validRequestBody.password);
			if (!isPasswordValid) return next(createError(401, "incorrect password."));
			await user.deleteUser();
			await user.save();

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
};

const clear = async (req, res, next) => {
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
};

const blocked = async (req, res, next) => {
	const { user } = req;

	try {
		await user.populateBlocked();
		return res.status(200).json(user.blocked);
	} catch (error) {
		return next(error);
	}
};

export default {
	signup,
	login,
	logout,
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
	terminate,
	blockDevice,
	resetPassword,
	blocked,
};
