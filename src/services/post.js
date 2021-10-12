import mongoose from "mongoose";
import createHttpError from "http-errors";

import RunUnitOfWork from "../database/RunUnitOfWork.js";

import UserService from "./user.js";
import NotificationService from "./notification.js";

import Post from "../models/post.js";
import Comment from "../models/comment.js";
import User from "../models/user.js";
import Reply from "../models/reply.js";

const getPostById = async (id, { session } = {}) => {
	const post = await Post.findById(id).session(session);
	if (!post || post.deleted) throw createHttpError(404, "post is not found.");
	return post;
};

const submitNewPostAs = async (postDto, username, { session } = {}) => {
	const uow = async (uowSession) => {
		const user = await UserService.findByUsername(username, { uowSession });
		const post = new Post({
			username: user.username,
			displayname: user.profile.displayname,
			subscribers: [user.username],
			...postDto,
		});
		await post.save({ uowSession });
		user.incrementPostsCounter();
		await user.save({ uowSession });

		const liked = post.isLikedBy(username);
		const newPost = { ...post.toJSON(), liked };
		return newPost;
	};

	const newPost = await (!session ? RunUnitOfWork(uow) : uow(session));
	return newPost;
};

const likePost = async (postId, username, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post is not found");
		if (post.isLikedBy(username)) throw createHttpError(401, "post is already liked.");
		post.likePostBy(username);
		await Promise.all([
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.pushLikeNotification(user, post, { session: uowSession }),
		]);
	};
	await (!session ? RunUnitOfWork(uow) : uow(session));
};

const unlikePost = async (postId, username, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post is not found");
		if (!post.isLikedBy(username)) throw createHttpError(401, "post is already liked.");
		post.unlikePostBy(username);
		await Promise.all([
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.popCommentNotification(user, post, { session: uowSession }),
		]);
	};
	await (!session ? RunUnitOfWork(uow) : uow(session));
};

const getPostLikes = async (postId, username) => {
	const post = await getPostById(postId);

	if (username !== post.username) throw createHttpError(401, "only authors can view likes list.");

	const likes = await User.aggregate([
		{
			$match: {
				username: { $in: post.likes },
			},
		},
		{ $project: { username: true, displayname: "$profile.displayname", _id: false } },
	]);

	// const likes = await Post.aggregate([
	// 	{
	// 		$match: {
	// 			username: { $in: post.likes },
	// 		},
	// 	},
	// 	{ $project: { username: true, displayname: "$profile.displayname", _id: false } },
	// ]);

	return likes;
};

const removePostsByUsername = async (username, deletedBy, { session }) => {
	await Post.updateMany(
		{
			username,
			deleted: false,
			createdAt: { $gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS) },
		},
		{ deleted: true, deletedBy },
		{ session },
	);
};

const removePostById = async (id, deletedBy, { session } = {}) => {
	await Post.findOneAndUpdate(
		{
			_id: id,
			deleted: false,
			createdAt: { $gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS) },
		},
		{ deleted: true, deletedBy },
		{ session },
	);
};

const getCommentById = async (id, { session } = {}) => {
	const comment = await Comment.findById(id).session(session);
	if (!comment || comment.deleted) throw createHttpError(404, "comment is not found.");
	return comment;
};

const getPostsByUsername = async (username, lastId) => {
	const limit = 20;
	const sort = { _id: -1 };
	const match = { deleted: false, username };
	const idMatch = (id) => (id ? { _id: { $lt: mongoose.Types.ObjectId(id) } } : {});

	const userPosts = await Post.aggregate([
		{
			$match: {
				...match,
				...idMatch(lastId),
				createdAt: {
					$gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS),
				},
			},
		},
		{
			$addFields: {
				isLiked: {
					$cond: [{ $in: [username, "$likes"] }, true, false],
				},
			},
		},
	])
		.sort(sort)
		.limit(limit);

	let lastPage = false;
	if (userPosts.length < limit) lastPage = true;

	const results = { count: userPosts.length, posts: userPosts, lastPage };
	return results;
};

const deleteUserOwnPost = async (postId, username, { session } = {}) => {
	const [post, user] = await Promise.all([
		getPostById(postId, { session }),
		UserService.findByUsername(username, { session }),
	]);

	if (user.isBlockingOrBlockedBy(username)) throw createHttpError(404, "post not found.");
	if (post.username !== user.username) throw createHttpError(400, "unauthorized.");
	post.remove();
	await post.save({ session });
};

const deleteUserOwnComment = async (postId, commentId, username, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, comment, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			getCommentById(commentId, { session: uowSession }),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post was not found.");
		if (!comment.postId.equals(post._id)) throw createHttpError(404, "comment was not found.");
		if (user.username !== comment.username) throw createHttpError(401, "unauthorized.");
		comment.deleted = true;
		post.stats.comments -= 1;

		await Promise.all([
			comment.save({ session: uowSession }),
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.popCommentNotification(user, post, { session: uowSession }),
		]);
	};
	await (!session ? RunUnitOfWork(uow) : uow(session));
};

const deleteUserOwnReply = async (postId, commentId, replyId, username, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, comment, reply, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			getCommentById(commentId, { session: uowSession }),
			Reply.findOne({ postId, commentId, _id: replyId, deleted: false }),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post was not found.");
		if (user.isBlockingOrBlockedBy(comment.username)) throw createHttpError(404, "comment was not found.");
		if (!comment.postId.equals(post._id)) throw createHttpError(404, "comment was not found.");
		if (!reply.commentId.equals(comment._id)) throw createHttpError(404, "reply was not found.");
		if (user.username !== reply.username) throw createHttpError(401, "unauthorized.");
		reply.deleted = true;
		comment.replies -= 1;

		await Promise.all([
			reply.save({ session: uowSession }),
			comment.save({ session: uowSession }),
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.popReplyNotification(user, post, { session: uowSession }),
		]);
	};
	await RunUnitOfWork(uow, session);
};

const replyOnCommentAs = async (postId, commentId, username, replyDto, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, comment, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			Comment.findOne({ postId, _id: commentId, deleted: false }).session(uowSession),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username) || user.isBlockingOrBlockedBy(comment.username))
			throw createHttpError(404, "comment not found.");
		if (!post.allowComments) throw createHttpError(403, "comments are not allowed on this post.");

		const reply = new Reply({
			postId: post._id,
			commentId: comment._id,
			username: user.username,
			displayname: user.profile.displayname,
			...replyDto,
		});

		comment.hasReplies = true;
		comment.stats.replies += 1;
		await Promise.all([
			reply.save({ session: uowSession }),
			comment.save({ session: uowSession }),
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.pushCommentNotification(username, post),
		]);

		return reply;
	};
	const newReply = await RunUnitOfWork(uow, session); // TODO: change all of RunUnitOfWork to this
	return newReply;
};

const commentOnPostAs = async (postId, username, commentDto, { session } = {}) => {
	const uow = async (uowSession) => {
		const [post, user] = await Promise.all([
			getPostById(postId, { session: uowSession }),
			UserService.findByUsername(username, { session: uowSession }),
		]);

		if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post not found.");
		if (!post.allowComments) throw createHttpError(403, "comments are not allowed on this post.");

		const comment = new Comment({
			postId: post._id,
			username: user.username,
			displayname: user.profile.displayname,
			...commentDto,
		});

		post.stats.comments += 1;
		await Promise.all([
			comment.save({ session: uowSession }),
			post.save({ session: uowSession }),
			// TODO:
			// NotificationService.pushCommentNotification(username, post),
		]);

		return comment;
	};
	const newComment = await RunUnitOfWork(uow, session); // TODO: change all of RunUnitOfWork to this
	return newComment;
};

const getNewsfeedForUser = async (username, type, lastPostId) => {
	const $match = {};
	const idMatch = (id) => (id ? { _id: { $lt: mongoose.Types.ObjectId(id) } } : {});

	const usernameMatch = (timelineType) =>
		timelineType === "followees"
			? { username: { $in: ["$followees"] } }
			: { username: { $nin: ["$blocked", "$blocking"] } };

	const limit = 20;
	let sort = { _id: -1 };

	switch (type) {
		case "latest":
			break;
		case "followees":
			$match.username = { $in: ["$followees"] };
			break;
		case "hot":
			sort = { "stats.likes": -1 };
			break;
		default:
			throw createHttpError(400, "invalid newsfeed type.");
	}

	const posts = await User.aggregate([
		{
			$match: {
				username,
			},
		},
		{
			$lookup: {
				from: "posts",
				pipeline: [
					{
						$match: {
							...idMatch(lastPostId),
							...usernameMatch(type),
							deleted: false,
							createdAt: {
								$gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS),
							},
						},
					},
					{
						$sort: sort,
					},
					{
						$limit: limit,
					},
					{
						$project: {
							username: true,
							displayname: true,
							text: true,
							stats: true,
							hashtags: true,
							allowComments: true,
							flags: true,
							createdAt: true,
							updatedAt: true,
							liked: {
								$in: ["$username", "$likes"],
							},
						},
					},
				],
				as: "timeline",
			},
		},
		{
			$project: {
				_id: false,
				timeline: true,
			},
		},
	]);

	let lastPage = false;
	if (posts.length < limit) lastPage = true;

	const payload = { posts, lastPage };
	return payload;
};

const getRepliesOnCommentAs = async (postId, commentId, username, lastReplyId) => {
	const idMatch = (id) => (id ? { _id: { $lt: mongoose.Types.ObjectId(id) } } : {});

	const [post, user, comment] = await Promise.all([
		getPostById(postId),
		UserService.findByUsername(username),
		Comment.findOne({ _id: commentId, postId }),
	]);

	if (user.isBlockingOrBlockedBy(post.username) || user.isBlockingOrBlockedBy(comment.username))
		throw createHttpError(404, "post was not found.");

	if (comment.deleted) throw createHttpError(404, "comment was not found.");

	const replies = await Reply.find({
		postId,
		commentId,
		...idMatch(lastReplyId),
		deleted: false,
		username: { $nin: [...user.blocking, ...user.blocked] },
	})
		.sort({ _id: -1 })
		.limit(20)
		.select("-__v -postId -updatedAt -deleted")
		.exec();

	return replies;
};

const getCommentsOnPostAs = async (postId, username, lastCommentId) => {
	const idMatch = (id) => (id ? { _id: { $lt: mongoose.Types.ObjectId(id) } } : {});

	const [post, user] = await Promise.all([getPostById(postId), UserService.findByUsername(username)]);

	if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post was not found.");

	const comments = await Comment.find({
		postId,
		...idMatch(lastCommentId),
		deleted: false,
		username: { $nin: [...user.blocking, ...user.blocked] },
	})
		.sort({ _id: -1 })
		.limit(20)
		.select("-__v -postId -updatedAt -deleted")
		.exec();

	return comments;
};

// TODO: delete, reports moved to report service
// const reportPost = async (postId, reporterUsername, { session } = {}) => {
// 	const [reporter, post] = await Promise.all([UserService.findByUsername(reporterUsername), getPostById(postId)]);

// 	if (!post || reporter.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post is not found.");
// 	post.markAsReported();
// 	await post.save({ session });
// };

// const reportComment = async (postId, commentId, reporterUsername, { session } = {}) => {
// 	const [reporter, post, comment] = await Promise.all([
// 		UserService.findByUsername(reporterUsername),
// 		getPostById(postId),
// 		Comment.findOne({ _id: commentId, postId }),
// 	]);

// 	if (!comment || reporter.isBlockingOrBlockedBy(post.username) || reporter.isBlockingOrBlockedBy(comment.username))
// 		throw createHttpError(404, "post is not found.");

// 	comment.reported = true;
// 	await comment.save({ session });
// };

export default {
	getPostById,
	// reportPost,
	// reportComment,
	replyOnCommentAs,
	getPostLikes,
	deleteUserOwnReply,
	getCommentById,
	deleteUserOwnPost,
	removePostById,
	removePostsByUsername,
	deleteUserOwnComment,
	getCommentsOnPostAs,
	getPostsByUsername,
	getRepliesOnCommentAs,
	submitNewPostAs,
	commentOnPostAs,
	getNewsfeedForUser,
	likePost,
	unlikePost,
};
