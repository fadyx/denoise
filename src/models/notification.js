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

notificationSchema.methods.markReadBy = async function markReadBy(username) {
	this.read.addToSet(username);
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
