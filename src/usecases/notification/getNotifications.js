import NotificationService from "../../services/notification.js";

const getNotifications = async (username, lastId) => {
	const notifications = await NotificationService.getNotificationsByUsername(username, lastId);
	return notifications;
};

export default getNotifications;
