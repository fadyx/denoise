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
	const { username } = req.decodedAccessToken;
	const user = await getMyProfileUseCase(username);
	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const getUser = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { username: requestedUserUsername } = req.params;
	if (!validation.isValidUsername(requestedUserUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	const user = await (username === requestedUserUsername
		? getMyProfileUseCase(username)
		: getUserProfileUseCase(username, requestedUserUsername));
	const payload = { user };
	const response = SuccessResponse("fetched user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const updateProfile = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const updates = req.body;
	const user = await updateProfileUseCase(username, updates);
	const payload = { user };
	const response = SuccessResponse("updated user successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const follow = catchAsync(async (req, res) => {
	const { username: followerUsername } = req.decodedAccessToken;
	const followeeUsername = req.params.username;
	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	await followUserUseCase(followerUsername, followeeUsername);
	const response = SuccessResponse("followed user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unfollow = catchAsync(async (req, res) => {
	const { username: followerUsername } = req.decodedAccessToken;
	const followeeUsername = req.params.username;
	if (!validation.isValidUsername(followeeUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	await unfollowUserUseCase(followerUsername, followeeUsername);
	const response = SuccessResponse("unfollowed user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const block = catchAsync(async (req, res) => {
	const { username: blockerUsername } = req.decodedAccessToken;
	const blockedUsername = req.params.username;
	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "user is not found.");
	await blockUserUseCase(blockerUsername, blockedUsername);
	const response = SuccessResponse("blocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const unblock = catchAsync(async (req, res) => {
	const { username: blockerUsername } = req.decodedAccessToken;
	const blockedUsername = req.params.username;
	if (!validation.isValidUsername(blockedUsername)) throw httpError(httpStatus.NOT_FOUND, "User not found.");
	await unblockUserUseCase(blockerUsername, blockedUsername);
	const response = SuccessResponse("unblocked user successfully.");
	return res.status(httpStatus.OK).json(response);
});

const myPosts = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const { lastId } = req.query;

	if (lastId && !validation.isValidObjectId(lastId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");

	const payload = await getUserPostsUseCase(username, lastId);
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const userPosts = catchAsync(async (req, res) => {
	const { requesterUsername } = req.decodedAccessToken;
	const { username: requestedUsername } = req.params;
	const { lastId } = req.query;
	if (!validation.isValidUsername(requestedUsername)) throw httpError(httpStatus.NOT_FOUND, "user was not found.");
	if (lastId && !validation.isValidObjectId(lastId))
		throw httpError(httpStatus.BAD_REQUEST, "invalid pagination key.");
	const payload = await getUserPostsForUseCase(requesterUsername, requestedUsername, lastId);
	const response = SuccessResponse("fetched posts successfully.", payload);
	return res.status(httpStatus.OK).json(response);
});

const clear = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	await selfClearUserPostsUseCase(username);
	const response = SuccessResponse("cleared posts successfully.");
	return res.status(httpStatus.OK).json(response);
});

const blocked = catchAsync(async (req, res) => {
	const { username } = req.decodedAccessToken;
	const blockedUsers = await getBlockedUsersFor(username);
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
