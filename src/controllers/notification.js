import httpStatus from "http-status";
import httpError from "http-errors";

import Notification from "../models/notification.js";
import validation from "../utils/validation.js";
import catchAsync from "../middleware/catchAsyncErrors.js";
import { SuccessResponse } from "../utils/apiResponse.js";

const getNotifications = catchAsync(async (req, res) => {
	const { user } = req;

	const notifications = await Notification.aggregate([
		{ $match: { recipients: { $in: [user.username] } } },
		{ $addFields: { read: { $in: [user.username, "$read"] } } },
		{ $sort: { updatedAt: -1 } },
		{ $project: { type: true, read: true, expiresAt: true, postId: true, engagement: true, updatedAt: true } },
	]);

	const payload = { notifications };
	const response = SuccessResponse("fetched notifications successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const readNotification = catchAsync(async (req, res) => {
	const { user } = req;
	const { notificationId } = req.params;

	if (!validation.isValidObjectId(notificationId))
		throw httpError(httpStatus.NOT_FOUND, "notification was not found.");
	const notification = Notification.findById(notificationId);
	if (!notification) throw httpError(httpStatus.NOT_FOUND, "notification was not found.");
	notification.read.addToSet(user.username);
	await notification.save({ timestamps: false });

	const payload = { notification };
	const response = SuccessResponse("marked notification as read successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const readAllNotification = catchAsync(async (req, res) => {
	const { user } = req;

	await Notification.updateMany(
		{ recipients: { $in: [user.username] } },
		{ $addToSet: { read: user.username } },
		{ timestamps: false },
	);

	const response = SuccessResponse("marked all notifications as read successfully.");
	return res.status(httpStatus.OK).json(response);
});

export default {
	getNotifications,
	readNotification,
	readAllNotification,
};
