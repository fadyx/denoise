import mongoose from "mongoose";

import { notificationTypes } from "../constants/NotificationType.js";

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

		recipient: {
			required: true,
			type: String,
			index: true,
		},

		subscribed: {
			type: Boolean,
			default: true,
		},

		postId: {
			type: mongoose.Types.ObjectId,
			ref: "Post",
			index: true,
			default: null,
		},

		subscribers: {
			type: [
				{
					type: mongoose.Types.ObjectId,
					ref: "User",
					require: [true, "user id is required."],
				},
			],
			default: null,
			index: true,
		},
	},
	{ timestamps: true },
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: process.env.LIFESPAN_SECONDS });

notificationSchema.statics.push = async function push(type, recipient, postId) {
	const Notification = this;
	const notification = new Notification({ type, recipient, postId });
	await notification.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
