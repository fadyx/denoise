import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import AuthService from "../../services/auth.js";
import PostService from "../../services/post.js";
import NotificationService from "../../services/notification.js";

const terminate = async (username, password) => {
	const uow = async (session) => {
		await AuthService.terminate({ username, password }, { session });
		await PostService.removePostsByUsername({ username, deletedBy: username }, { session });
		await NotificationService.removeNotificationsByUsername({ username }, { session });
	};
	const terminatePayload = await RunUnitOfWork(uow);
	return terminatePayload;
};

export default terminate;
