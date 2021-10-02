import httpStatus from "http-status";
import httpError from "http-errors";

import validation from "../utils/validation.js";
import catchAsync from "../middleware/catchAsyncErrors.js";
import { SuccessResponse } from "../utils/apiResponse.js";

import getNotificationsUseCase from "../usecases/notification/getNotifications.js";
import readNotificationUseCase from "../usecases/notification/readNotification.js";
import readAllNotificationUseCase from "../usecases/notification/readAllNotifications.js";

const getNotifications = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const { lastId } = req.params;
	if (lastId && !validation.isValidObjectId(lastId)) throw httpError(httpStatus.NOT_FOUND, "invalid last id.");
	const notifications = await getNotificationsUseCase(decodedAccessToken.username, lastId);
	const payload = { notifications };
	const response = SuccessResponse("fetched notifications successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const readNotification = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const { notificationId } = req.params;
	if (!validation.isValidObjectId(notificationId))
		throw httpError(httpStatus.NOT_FOUND, "notification was not found.");
	const notification = await readNotificationUseCase(notificationId, decodedAccessToken.username);
	const payload = { notification };
	const response = SuccessResponse("marked notification as read successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const readAllNotification = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	await readAllNotificationUseCase(decodedAccessToken.username);
	const response = SuccessResponse("marked all notifications as read successfully.");
	return res.status(httpStatus.OK).json(response);
});

export default {
	getNotifications,
	readNotification,
	readAllNotification,
};
