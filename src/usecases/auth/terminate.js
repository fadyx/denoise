import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import userService from "../../services/user.js";
import PostService from "../../services/post.js";
import NotificationService from "../../services/notification.js";

const terminate = async (username, password) => {
	const uow = async (session) => {
		await userService.terminate(username, password, { session });
		await PostService.removePostsByUsername(username, username, { session });
		// TODO: promise.all()
		// await NotificationService.removeNotificationsByUsername(username, { session });
	};
	const terminatePayload = await RunUnitOfWork(uow);
	return terminatePayload;
};

export default terminate;
