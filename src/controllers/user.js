import httpError from "http-errors";
import httpStatus from "http-status";

import catchAsync from "../middleware/catchAsyncErrors.js";
import validation from "../utils/validation.js";
import { SuccessResponse } from "../utils/apiResponse.js";

import blockUserUseCase from "../usecases/user/blockUser.js";
import followUserUseCase from "../usecases/user/followUser.js";
import getMyProfileUseCase from "../usecases/user/getMyProfile.js";
import getUserPostsForUseCase from "../usecases/post/getUserPostsFor.js";
import getUserPostsUseCase from "../usecases/post/getUserPosts.js";
import getUserProfileUseCase from "../usecases/user/getUserProfile.js";
import selfClearUserPostsUseCase from "../usecases/post/selfClearUserPosts.js";
import unblockUserUseCase from "../usecases/user/unblockUser.js";
import unfollowUserUseCase from "../usecases/user/unfollowUser.js";
import updateProfileUseCase from "../usecases/user/updateProfile.js";
import getBlockedUsersFor from "../usecases/user/getBlockedUsersFor.js";

const myProfile = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const user = await getMyProfileUseCase(decodedAccessToken.username);
	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getUser = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const { requestedUserUsername } = req.params;

	if (!validation.isValidUsername(requestedUserUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");

	let user;

	if (decodedAccessToken.username === requestedUserUsername)
		user = await getMyProfileUseCase(decodedAccessToken.username);
	else user = await getUserProfileUseCase(decodedAccessToken.username, requestedUserUsername);

	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const updateProfile = async (req, res) => {
	const { decodedAccessToken } = req;
	const updates = req.body;
	const user = await updateProfileUseCase(decodedAccessToken.username, updates);
	const payload = { user };
	const response = SuccessResponse("updated user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
};

const follow = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const followeeUsername = req.params.username;
	const followerUsername = decodedAccessToken.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	if (followerUsername === followeeUsername) throw httpError(httpStatus.NOT_ACCEPTABLE, "cannot follow oneself.");

	const user = await followUserUseCase(followerUsername, followeeUsername);

	const payload = { user };
	const response = SuccessResponse("followed user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const unfollow = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const followeeUsername = req.params.username;
	const followerUsername = decodedAccessToken.username;

	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	if (followerUsername === followeeUsername) throw httpError(httpStatus.NOT_ACCEPTABLE, "cannot unfollow oneself.");

	const user = await unfollowUserUseCase(followerUsername, followeeUsername);

	const payload = { user };
	const response = SuccessResponse("unfollowed user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const block = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const blockedUsername = req.params.username;
	const blockerUsername = decodedAccessToken.username;
	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	await blockUserUseCase(blockerUsername, blockedUsername);
	const response = SuccessResponse("blocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unblock = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const blockedUsername = req.params.username;
	const blockerUsername = decodedAccessToken.username;
	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "User not found.");
	await unblockUserUseCase(blockerUsername, blockedUsername);
	const response = SuccessResponse("unblocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const myPosts = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const { lastId } = req.query;

	if (lastId && !validation.isValidObjectId(lastId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");

	const payload = await getUserPostsUseCase(decodedAccessToken.username, lastId);
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const userPosts = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const { username } = req.params;
	const { lastId } = req.query;
	if (!validation.isValidUsername(username)) throw httpError(httpStatus.NOT_FOUND, "user was not found.");
	if (lastId && !validation.isValidObjectId(lastId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");
	const payload = await getUserPostsForUseCase(decodedAccessToken.username, lastId);
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const clear = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	await selfClearUserPostsUseCase(decodedAccessToken.username);
	const response = SuccessResponse("cleared posts successfully.");
	return res.status(httpStatus.OK).json(response);
});

const blocked = catchAsync(async (req, res) => {
	const { decodedAccessToken } = req;
	const blockedUsers = await getBlockedUsersFor(decodedAccessToken.username);
	const payload = { count: blockedUsers.length, blocked: blockedUsers };
	const response = SuccessResponse("fetched blocked users successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

export default {
	block,
	blocked,
	clear,
	follow,
	getUser,
	myPosts,
	myProfile,
	unblock,
	unfollow,
	updateProfile,
	userPosts,
};
