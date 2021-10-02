import httpError from "http-errors";
import httpStatus from "http-status";
import { NotificationType } from "../constants/NotificationType.js";

import Notification from "../models/notification.js";

const removeNotificationsByUsername = async ({ username }, { session }) => {
	await Notification.deleteMany({ owner: username }, { session });
};

const getNotificationsByUsername = async ({ username, lastId }, { session }) => {
	const idMatch = () => (lastId ? { $lt: lastId } : undefined);

	const notifications = await Notification.aggregate(
		[
			{ $match: { _id: idMatch(), recipients: { $in: [username] } } },
			{ $addFields: { read: { $in: [username, "$read"] } } },
			{ $sort: { updatedAt: -1 } },
			{ limit: 20 },
			{ $project: { type: true, read: true, expiresAt: true, postId: true, engagement: true, updatedAt: true } },
		],
		{ session },
	);

	return notifications;
};

const getNotificationById = async ({ notificationId }, { session }) => {
	const notification = Notification.findById(notificationId).session(session);
	return notification;
};

const markNotificationAsReadByUsername = async ({ notificationId, username }, { session }) => {
	const notification = Notification.findById(notificationId);
	if (!notification || !notification.recipients.includes(username))
		throw httpError(httpStatus.NOT_FOUND, "notification was not found.");
	notification.markReadBy(username);
	await notification.save({ timestamps: false, session });
};

const markAllNotificationAsReadForUser = async ({ username }, { session }) => {
	await Notification.updateMany(
		{ recipients: { $in: [username] } },
		{ $addToSet: { read: username } },
		{ timestamps: false, session },
	);
};

const pushStarNotification = async ({ recipient, starer }, { session }) => {
	const exists = await Notification.findOne({ type: NotificationType.STAR, recipients: { $in: [recipient] }, starer });
	if (exists) return;

	const type = NotificationType.STAR;
	const expiresAt = Date.now() + parseInt(process.env.LIFESPAN_MILLISECONDS, 10);
	const recipients = [recipient];
	const read = [];

	const notification = new Notification({ type, starer, recipients, expiresAt, read });
	await notification.save({ session });
};

const pushLikeNotification = async ({ sender, post }, { session }) => {
	const existingNotification = await Notification.findOne({ type: NotificationType.LIKE, postId: post._id });
	if (existingNotification) {
		existingNotification.read = [];
		existingNotification.engagement.recent.push(sender);
		existingNotification.engagement.total = post.stats.likes;
		return existingNotification.save();
	}

	const type = NotificationType.LIKE;
	const expiresAt = new Date(post.createdAt).getTime() + parseInt(process.env.LIFESPAN_MILLISECONDS, 10);
	const recipients = [post.username];
	const postId = post._id;
	const read = [];
	const owner = post.username;
	const engagement = {
		recent: [sender],
		total: post.stats.likes,
	};

	const notification = new Notification({ type, recipients, expiresAt, postId, read, engagement, owner });
	return notification.save({ session });
};

const popLikeNotification = async ({ sender, post }, { session }) => {
	const existingNotification = await Notification.findOne({ type: NotificationType.LIKE, postId: post._id });
	if (!existingNotification) return;

	existingNotification.engagement.recent.remove(sender);
	existingNotification.engagement.total = post.stats.likes;
	if (existingNotification.engagement.total === 0) await existingNotification.remove();
	else await existingNotification.save({ timestamps: false, session });
};

const pushCommentNotification = async ({ sender, post }, { session }) => {
	const existingNotification = await Notification.findOne({ type: NotificationType.COMMENT, postId: post._id });
	if (existingNotification) {
		existingNotification.read = [];
		existingNotification.engagement.recent.addToSet(sender);
		existingNotification.engagement.total = post.stats.comments;
		return existingNotification.save();
	}

	const type = NotificationType.COMMENT;
	const expiresAt = new Date(post.createdAt).getTime() + parseInt(process.env.LIFESPAN_MILLISECONDS, 10);
	const recipients = post.subscribers;
	const postId = post._id;
	const read = [];
	const owner = post.username;
	const engagement = {
		recent: [sender],
		total: post.stats.comments,
	};

	const notification = new Notification({ type, recipients, expiresAt, postId, read, engagement, owner });
	return notification.save({ session });
};

const popCommentNotification = async ({ sender, post }, { session }) => {
	const existingNotification = await Notification.findOne({ type: NotificationType.COMMENT, postId: post._id });
	if (!existingNotification) return;

	existingNotification.engagement.recent.remove(sender);
	existingNotification.engagement.total = post.stats.comments;
	if (existingNotification.engagement.total === 0) await existingNotification.remove();
	else await existingNotification.save({ timestamps: false, session });
};

const deleteNotificationsByPostId = async ({ postId }, { session }) => {
	await Notification.deleteMany({ postId }, { session });
};

const unsubscribeUserFromUserPosts = async ({ nonsubscriber, owner }, { session }) => {
	await Notification.updateMany({ owner }, { $pull: { recipients: nonsubscriber } }, { session });
};

export default {
	removeNotificationsByUsername,
	getNotificationsByUsername,
	getNotificationById,
	markNotificationAsReadByUsername,
	markAllNotificationAsReadForUser,
	pushStarNotification,
	pushLikeNotification,
	popLikeNotification,
	pushCommentNotification,
	popCommentNotification,
	deleteNotificationsByPostId,
	unsubscribeUserFromUserPosts,
};
