import mongoose from "mongoose";
import httpError from "http-errors";
import httpStatus from "http-status";

import Post from "../models/post.js";
import Comment from "../models/comment.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";
import validation from "../utils/validation.js";
import { SuccessResponse } from "../utils/apiResponse.js";
import User from "../models/user.js";

const createPost = catchAsync(async (req, res) => {
	const { user } = req;
	const postDto = req.body;

	const uow = async (session) => {
		const post = new Post({
			username: user.username,
			displayname: user.profile.displayname,
			text: postDto.text,
			allowComments: postDto.allowComments,
			flags: postDto.flags,
		});
		await post.save({ session });
		user.profile.stats.posts += 1;
		await user.save({ session });
		return post;
	};

	const post = await RunUnitOfWork(uow);

	const liked = post.likes.includes(user.username);

	const payload = { post: { ...post.toJSON(), liked } };
	const response = SuccessResponse("created post successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getPost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const post = await Post.findById(postId);
	if (!post || user.isBlockingOrBlockedBy(post.username)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const liked = post.likes.includes(user.username);

	const payload = { post: { ...post.toJSON(), liked } };
	const response = SuccessResponse("fetched post successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const createComment = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;
	const commentDto = req.body;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const uow = async (session) => {
		const post = await Post.findById(postId).session(session);
		if (!post || user.isBlockingOrBlockedBy(post.username))
			throw httpError(httpStatus.NOT_FOUND, "post was not found.");
		if (!post.allowComments) throw httpError(403, "comments are not allowed on this post.");
		const comment = new Comment({
			postId: post._id,
			username: user.username,
			displayname: user.profile.displayname,
			text: commentDto.text,
		});
		await comment.save({ session });
		post.stats.comments += 1;
		await post.save({ session });
		return comment;
	};
	const comment = await RunUnitOfWork(uow);

	const payload = { comment };
	const response = SuccessResponse("created comment successfully.", payload);
	return res.status(httpStatus.CREATED).json(response);
});

const deletePost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const post = await Post.findById(postId);
	if (!post || post.deleted || !(await user.isBlockingOrBlockedBy(post.username)))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	if (!user.username === post.username) throw httpError(httpStatus.UNAUTHORIZED, "unauthorized.");
	post.deleted = true;
	await post.save();

	const response = SuccessResponse("deleted post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const deleteComment = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;
	const { commentId } = req.params;

	if (!validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");

	const post = await Post.findById(postId);
	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const comment = await Comment.findById(commentId);
	if (!comment || comment.deleted || !comment.postId.equals(post._id))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");
	if (!user._id.equals(comment.userId)) throw httpError(httpStatus.UNAUTHORIZED, "unauthorized.");
	comment.deleted = true;
	post.stats.comments -= 1;

	const uow = async (session) => {
		await comment.save({ session });
		await post.save({ session });
	};
	await RunUnitOfWork(uow);

	const response = SuccessResponse("deleted comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

const likePost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const post = await Post.findById(postId);

	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	if (post.likes.includes(user.username)) throw httpError(httpStatus.FORBIDDEN, "post is already liked.");
	post.likes.addToSet(user.username);
	await post.save();

	const response = SuccessResponse("liked post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unlikePost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const post = await Post.findById(postId);
	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	if (!post.likes.includes(user.username)) throw httpError(httpStatus.FORBIDDEN, "post is already not liked.");
	post.likes.addToSet(user.username);
	await post.save();

	const response = SuccessResponse("unliked post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const getPostLikes = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const post = await Post.findById(postId);
	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	if (user.username !== post.username) httpError(httpStatus.FORBIDDEN, "only authors can view likes list.");

	const likes = await User.aggregate([
		{
			$match: {
				username: { $in: post.likes },
			},
		},
		{ $project: { username: true, displayname: "$profile.displayname", _id: false } },
	]);

	const payload = { likes };
	const response = SuccessResponse("fetched post likes successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getPostComments = catchAsync(async (req, res) => {
	const { user } = req;
	const { lastCommentId } = req.query;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	if (lastCommentId && !validation.isValidObjectId(lastCommentId))
		throw httpError(httpStatus.NOT_FOUND, "invalid pagination key.");
	const post = await Post.findById(postId);
	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const comments = await Comment.find({
		postId,
		_id: { $lt: mongoose.Types.ObjectId(lastCommentId) },
		deleted: false,
		username: { $nin: [...user.blocking, ...user.blocked] },
	})
		.sort({ _id: -1 })
		.limit(20)
		.select("-__v -postId -updatedAt -deleted")
		.exec();

	const payload = { comments };
	const response = SuccessResponse("fetched post comments successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const newsfeed = catchAsync(async (req, res) => {
	const { user } = req;
	const { lastPostId } = req.query;
	const { type } = req.params;
	if (lastPostId && !validation.isValidObjectId(lastPostId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");
	const match = {};
	if (lastPostId) match._id = { $lt: mongoose.Types.ObjectId(lastPostId) };
	const limit = 20;
	let sort;

	switch (type) {
		case "latest":
			sort = { _id: -1 };
			match.username = { $nin: [...user.blocking, ...user.blocked] };
			break;
		case "followees":
			sort = { _id: -1 };
			match.username = { $in: user.followees };
			break;
		case "hot":
			match.username = { $nin: [...user.blocking, ...user.blocked] };
			sort = { "stats.likes": -1 };
			break;
		default:
			throw httpError(httpStatus.BAD_REQUEST, "invalid newsfeed type.");
	}

	const posts = await Post.aggregate([
		{
			$match: {
				...match,
				deleted: false,
				createdAt: {
					$gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS),
				},
			},
		},
		{
			$set: {
				liked: {
					$in: [user.username, "$likes"],
				},
			},
		},
	])
		.sort(sort)
		.limit(limit);

	let lastPage = false;
	if (posts.length < limit) lastPage = true;

	const payload = { posts, lastPage };
	const response = SuccessResponse("fetched newsfeed successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const reportPost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const post = await Post.findById(postId);

	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	post.reporters.addToSet(user.username);
	post.reported = true;
	await post.save();

	const response = SuccessResponse("post reported successfully.");
	return res.status(httpStatus.OK).json(response);
});

const reportComment = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;
	const { commentId } = req.params;

	if (!validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");

	const post = await Post.findById(postId);
	if (!post || post.deleted || !user.isBlockingOrBlockedBy(post.username))
		throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	const comment = await Comment.findById(commentId);
	if (!comment || comment.deleted || !comment.postId.equals(post._id))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");

	comment.reporters.addToSet(user.username);
	comment.reported = true;
	await comment.save();

	const response = SuccessResponse("reported comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

export default {
	createPost,
	getPost,
	newsfeed,
	likePost,
	reportPost,
	unlikePost,
	createComment,
	deletePost,
	deleteComment,
	reportComment,
	getPostLikes,
	getPostComments,
};
