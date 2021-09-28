import mongoose from "mongoose";

import { NotificationType, notificationTypes } from "../constants/NotificationType.js";

const { Schema } = mongoose;

const notificationSchema = new Schema(
	{
		type: {
			type: String,
			required: [true, "notification type is required."],
			enum: {
				values: notificationTypes,
				message: "invalid notification type input.",
			},
		},

		recipients: [
			{
				required: true,
				type: String,
				index: true,
			},
		],

		read: [
			{
				required: true,
				type: String,
				index: true,
			},
		],

		expiresAt: {
			type: Date,
			required: true,
		},

		// properties of star notification only
		starer: {
			type: String,
			index: true,
		},

		// properties of like/comment notification only
		postId: {
			type: mongoose.Types.ObjectId,
			ref: "Post",
			index: true,
		},

		owner: {
			type: String,
			required: true,
		},

		engagement: {
			recent: [
				{
					type: String,
					required: true,
				},
			],
			total: {
				type: Number,
			},
		},
	},
	{ timestamps: true },
);

notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.pre("save", async function pre(next) {
	const notification = this;

	if (notification.type === NotificationType.LIKE || notification.type === NotificationType.COMMENT) {
		if (notification.engagement.recent.length > 3)
			notification.engagement.recent = notification.engagement.recent.slice(-3);
	}

	next();
});

notificationSchema.statics.pushStarNotification = async function pushStarNotification(recipient, starer) {
	const Notification = this;

	const exists = await Notification.findOne({ type: NotificationType.STAR, recipients: { $in: [recipient] }, starer });
	if (exists) return;

	const type = NotificationType.STAR;
	const expiresAt = Date.now() + parseInt(process.env.LIFESPAN_MILLISECONDS, 10);
	const recipients = [recipient];
	const read = [];

	const notification = new Notification({ type, starer, recipients, expiresAt, read });
	await notification.save();
};

notificationSchema.statics.pushLikeNotification = async function pushStarNotification(sender, post) {
	const Notification = this;

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
	return notification.save();
};

notificationSchema.statics.popLikeNotification = async function popStarNotification(sender, post) {
	const Notification = this;

	const existingNotification = await Notification.findOne({ type: NotificationType.LIKE, postId: post._id });
	if (!existingNotification) return;

	existingNotification.engagement.recent.remove(sender);
	existingNotification.engagement.total = post.stats.likes;
	if (existingNotification.engagement.total === 0) await existingNotification.remove();
	else await existingNotification.save({ timestamps: false });
};

notificationSchema.statics.pushCommentNotification = async function pushCommentNotification(sender, post) {
	const Notification = this;

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
	return notification.save();
};

notificationSchema.statics.popCommentNotification = async function popCommentNotification(sender, post) {
	const Notification = this;

	const existingNotification = await Notification.findOne({ type: NotificationType.COMMENT, postId: post._id });
	if (!existingNotification) return;

	existingNotification.engagement.recent.remove(sender);
	existingNotification.engagement.total = post.stats.comments;
	if (existingNotification.engagement.total === 0) await existingNotification.remove();
	else await existingNotification.save({ timestamps: false });
};

notificationSchema.statics.deletePostNotifications = async function deletePostNotifications(post) {
	const Notification = this;
	await Notification.deleteMany({ postId: post._id });
};

notificationSchema.statics.deleteUserNotifications = async function deleteUserNotifications(username) {
	const Notification = this;
	await Notification.deleteMany({ owner: username });
};

notificationSchema.statics.unsubscribeUserFromUserPosts = async function unsubscribeUserFromUserPosts(
	nonsubscriber,
	owner,
) {
	const Notification = this;
	await Notification.updateMany({ owner }, { $pull: { recipients: nonsubscriber } });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
