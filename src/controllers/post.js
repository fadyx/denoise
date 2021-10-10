import httpError from "http-errors";
import httpStatus from "http-status";

import catchAsync from "../middleware/catchAsyncErrors.js";
import validation from "../utils/validation.js";
import { SuccessResponse } from "../utils/apiResponse.js";

import submitNewPostUseCase from "../usecases/post/submitNewPost.js";
import getPostForUseCase from "../usecases/post/getPostFor.js";
import getCommentForUseCase from "../usecases/post/getCommentFor.js";
import deletePostUseCase from "../usecases/post/deletePost.js";
import commentOnPostUseCase from "../usecases/post/commentOnPost.js";
import deleteCommentUseCase from "../usecases/post/deleteComment.js";
import likePostUseCase from "../usecases/post/likePost.js";
import unlikePostUseCase from "../usecases/post/unlikePost.js";
import getPostLikesUseCase from "../usecases/post/getPostLikes.js";
import reportPostUseCase from "../usecases/post/reportPost.js";
import reportCommentUseCase from "../usecases/post/reportComment.js";
import reportReplyUseCase from "../usecases/post/reportReply.js";
import getNewsfeedForUserUseCase from "../usecases/post/newsfeed.js";
import getPostCommentsUseCase from "../usecases/post/getPostComments.js";
import getCommentRepliesUseCase from "../usecases/post/getCommentReplies.js";
import replyOnCommentUseCase from "../usecases/post/replyOnComment.js";
import deleteReplyUseCase from "../usecases/post/deleteReply.js";

const createPost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const postDto = req.body;
	const post = await submitNewPostUseCase(postDto, username);
	const payload = { post };
	const response = SuccessResponse("created post successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getPost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const payload = await getPostForUseCase(postId, username);
	const response = SuccessResponse("fetched post successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getComment = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId } = req.params;
	if (!postId || !commentId || !validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");
	const payload = await getCommentForUseCase(postId, commentId, username);
	const response = SuccessResponse("fetched comment successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const likePost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	await likePostUseCase(postId, username);
	const response = SuccessResponse("liked post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unlikePost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");

	await unlikePostUseCase(postId, username);

	const response = SuccessResponse("unliked post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const getPostLikes = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const likes = await getPostLikesUseCase(postId, username);
	const payload = { likes };
	const response = SuccessResponse("fetched post likes successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const createComment = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	const commentDto = req.body;
	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	const comment = await commentOnPostUseCase(postId, username, commentDto);
	const payload = { comment };
	const response = SuccessResponse("created comment successfully.", payload);
	return res.status(httpStatus.CREATED).json(response);
});

const createReply = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId } = req.params;
	const replyDto = req.body;
	if (!postId || !commentId || !validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "post/comment was not found.");
	const reply = await replyOnCommentUseCase(postId, commentId, username, replyDto);
	const payload = { reply };
	const response = SuccessResponse("created reply successfully.", payload);
	return res.status(httpStatus.CREATED).json(response);
});

const deletePost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	await deletePostUseCase(postId, username);
	const response = SuccessResponse("deleted post successfully.");
	return res.status(httpStatus.OK).json(response);
});

const getPostComments = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { lastCommentId } = req.query;
	const { postId } = req.params;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	if (lastCommentId && !validation.isValidObjectId(lastCommentId))
		throw httpError(httpStatus.NOT_FOUND, "invalid pagination key.");
	const comments = await getPostCommentsUseCase(postId, username, lastCommentId);
	const payload = { comments };
	const response = SuccessResponse("fetched post comments successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const deleteComment = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId } = req.params;
	if (!postId || !validation.isValidObjectId(postId) || !commentId || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");
	await deleteCommentUseCase(postId, commentId, username);
	const response = SuccessResponse("deleted comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

const deleteReply = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId, replyId } = req.params;
	if (
		!postId ||
		!commentId ||
		!replyId ||
		!validation.isValidObjectId(postId) ||
		!validation.isValidObjectId(commentId) ||
		!validation.isValidObjectId(replyId)
	)
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");
	await deleteReplyUseCase(postId, commentId, replyId, username);
	const response = SuccessResponse("deleted comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

const newsfeed = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { lastPostId } = req.query;
	const { type } = req.params;
	if (lastPostId && !validation.isValidObjectId(lastPostId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");

	const timeline = await getNewsfeedForUserUseCase(username, type, lastPostId);

	const payload = { timeline };
	const response = SuccessResponse("fetched newsfeed successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const reportPost = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId } = req.params;
	const { reportType, userFeedback } = req.body;

	if (!validation.isValidObjectId(postId)) throw httpError(httpStatus.NOT_FOUND, "post was not found.");
	await reportPostUseCase(postId, username, reportType, userFeedback);
	const response = SuccessResponse("post reported successfully.");
	return res.status(httpStatus.OK).json(response);
});

const reportComment = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId } = req.params;
	const { reportType, userFeedback } = req.body;

	if (!postId || !commentId || !validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");
	await reportCommentUseCase(postId, commentId, username, reportType, userFeedback);
	const response = SuccessResponse("reported comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

const reportReply = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { postId, commentId, replyId } = req.params;
	const { reportType, userFeedback } = req.body;

	if (
		!postId ||
		!commentId ||
		!replyId ||
		!validation.isValidObjectId(postId) ||
		!validation.isValidObjectId(commentId) ||
		!validation.isValidObjectId(replyId)
	)
		throw httpError(httpStatus.NOT_FOUND, "reply was not found.");

	await reportReplyUseCase(postId, commentId, replyId, username, reportType, userFeedback);
	const response = SuccessResponse("reported comment successfully.");
	return res.status(httpStatus.OK).json(response);
});

const getCommentReplies = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { lastReplyId } = req.query;
	const { postId, commentId } = req.params;

	if (!postId || !commentId || !validation.isValidObjectId(postId) || !validation.isValidObjectId(commentId))
		throw httpError(httpStatus.NOT_FOUND, "comment was not found.");

	if (lastReplyId && !validation.isValidObjectId(lastReplyId))
		throw httpError(httpStatus.NOT_FOUND, "invalid pagination key.");

	const replies = await getCommentRepliesUseCase(postId, commentId, username, lastReplyId);
	const payload = { replies };
	const response = SuccessResponse("fetched comment replies successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

// TODO: report reply

export default {
	createPost,
	getPost,
	newsfeed,
	likePost,
	reportPost,
	unlikePost,
	deleteReply,
	createComment,
	createReply,
	deletePost,
	getCommentReplies,
	getComment,
	deleteComment,
	reportComment,
	reportReply,
	getPostLikes,
	getPostComments,
};
