import PostService from "../../services/post.js";
import NotificationService from "../../services/notification.js";
import RunUnitOfWork from "../../database/RunUnitOfWork.js";

const selfClearUserPosts = async (username) => {
	const uow = async (session) => {
		await PostService.removePostsByUsername({ username, deletedBy: username }, { session });
		await NotificationService.removeNotificationsByUsername({ username }, { session });
	};
	await RunUnitOfWork(uow);
};

export default selfClearUserPosts;
