import PostService from "../../services/post.js";
import NotificationService from "../../services/notification.js";
import RunUnitOfWork from "../../database/RunUnitOfWork.js";

const deletePost = async (id, deletedBy) => {
	const uow = async (session) => {
		await Promise.all([
			PostService.deleteUserOwnPost(id, deletedBy, { session }),
			// TODO:
			// NotificationService.deleteNotificationsByPostId(id, { session }),
		]);
	};
	await RunUnitOfWork(uow);
};

export default deletePost;
