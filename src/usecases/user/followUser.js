import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import UserService from "../../services/user.js";
import NotificationService from "../../services/notification.js";

const followUser = async (followerUsername, followeeUsername) => {
	const uow = async (session) => {
		await UserService.followUser({ followerUsername, followeeUsername }, { session });
		await NotificationService.pushStarNotification(
			{ recipient: followeeUsername, starer: followerUsername },
			{ session },
		);
	};
	const user = await RunUnitOfWork(uow);
	return user;
};

export default followUser;
