import httpError from "http-errors";
import httpStatus from "http-status";

import { ReportType } from "../constants/ReportType.js";

import UserService from "./user.js";
import PostService from "./post.js";
import Report from "../models/report.js";
import Comment from "../models/comment.js";
import Reply from "../models/reply.js";

import { EntityType } from "../constants/EntityType.js";

const createReport = async (reporterUsername, reportType, entityType, entityId, userFeedback) => {
	const report = new Report({
		reporterUsername,
		reportType,
		entityType,
		entityId,
		userFeedback,
	});
	await report.save();
};

const reportPost = async (postId, reporterUsername, reportType, userFeedback) => {
	const [reporter, post] = await Promise.all([
		UserService.findByUsername(reporterUsername),
		PostService.getPostById(postId),
	]);
	if (!post || reporter.isBlockingOrBlockedBy(post.username)) throw httpError(404, "post is not found.");
	await createReport(reporterUsername, reportType, EntityType.POST, postId, userFeedback);
};

const reportComment = async (postId, commentId, reporterUsername, reportType, userFeedback) => {
	const [reporter, post, comment] = await Promise.all([
		UserService.findByUsername(reporterUsername),
		PostService.getPostById(postId),
		Comment.findOne({ _id: commentId, postId }),
	]);

	if (!comment || reporter.isBlockingOrBlockedBy(post.username) || reporter.isBlockingOrBlockedBy(comment.username))
		throw httpError(404, "post is not found.");
	await createReport(reporterUsername, reportType, EntityType.COMMENT, commentId, userFeedback);
};

const reportReply = async (postId, commentId, replyId, reporterUsername, reportType, userFeedback) => {
	const [reporter, post, comment, reply] = await Promise.all([
		UserService.findByUsername(reporterUsername),
		PostService.getPostById(postId),
		Comment.findOne({ _id: commentId, postId }),
		Reply.findOne({ _id: replyId, commentId, postId }),
	]);

	if (
		!post ||
		!comment ||
		!reply ||
		reporter.isBlockingOrBlockedBy(post.username) ||
		reporter.isBlockingOrBlockedBy(comment.username) ||
		reporter.isBlockingOrBlockedBy(reply.username)
	)
		throw httpError(404, "reply is not found.");

	await createReport(reporterUsername, reportType, EntityType.REPLY, replyId, userFeedback);
};

export default {
	createReport,
	reportPost,
	reportComment,
	reportReply,
};
