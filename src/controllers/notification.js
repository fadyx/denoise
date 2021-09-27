import httpError from "http-errors";
import httpStatus from "http-status";

import Post from "../models/post.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";
import { SuccessResponse } from "../utils/apiResponse.js";

const getNotifications = catchAsync(async (req, res) => {
	return res.status(httpStatus.OK).json("response");

	// const { user } = req;
	// const { username } = req.params;
	// if (!validation.isValidUsername(username)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	// if (user.username === username) {
	// 	const payload = { user };
	// 	const response = SuccessResponse("fetched user successfully.", payload);
	// 	return res.status(httpStatus.OK).json(response);
	// }
	// const requestedUser = await User.findByUsername(username);
	// if (user.isBlockingOrBlockedBy(requestedUser.username)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	// const isFollowed = user.followees.includes(requestedUser.username);
	// const payload = { user: { ...requestedUser.toJSON(), isFollowed } };
	// const response = SuccessResponse("fetched user successfully.", payload);
	// return res.status(httpStatus.OK).json(response);
});

export default {
	getNotifications,
};
