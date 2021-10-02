import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import UserService from "../../services/user.js";
import NotificationService from "../../services/notification.js";

const blockUser = async (blockerUsername, blockedUsername) => {
	const uow = async (session) => {
		UserService.blockUser({ blockerUsername, blockedUsername }, { session });
		NotificationService.unsubscribeUserFromUserPosts(
			{ nonsubscriber: blockerUsername, owner: blockedUsername },
			{ session },
		);
		NotificationService.unsubscribeUserFromUserPosts(
			{ nonsubscriber: blockedUsername, owner: blockerUsername },
			{ session },
		);
	};
	await RunUnitOfWork(uow);
};

export default blockUser;
