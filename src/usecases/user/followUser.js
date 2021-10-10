import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import UserService from "../../services/user.js";
import NotificationService from "../../services/notification.js";

const followUser = async (followerUsername, followeeUsername) => {
	const uow = async (session) => {
		await UserService.followUser(followerUsername, followeeUsername, { session });
		// TODO:
		// await NotificationService.pushStarNotification(followeeUsername, followerUsername, { session });
	};
	await RunUnitOfWork(uow);
};

export default followUser;
