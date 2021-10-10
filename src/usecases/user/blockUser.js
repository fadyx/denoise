import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import UserService from "../../services/user.js";
import NotificationService from "../../services/notification.js";

const blockUser = async (blockerUsername, blockedUsername) => {
	const uow = async (session) => {
		// TODO: Promise all
		await UserService.blockUser(blockerUsername, blockedUsername, { session });

		// TODO:
		// NotificationService.unsubscribeUserFromUserPosts(blockerUsername, blockedUsername, { session });
		// NotificationService.unsubscribeUserFromUserPosts(blockedUsername, blockerUsername, { session });
	};
	await RunUnitOfWork(uow);
};

export default blockUser;
