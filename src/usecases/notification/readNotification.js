import NotificationService from "../../services/notification.js";

const readNotification = async (notificationId, username) => {
	const notifications = await NotificationService.markNotificationAsReadByUsername(notificationId, username);
	return notifications;
};

export default readNotification;
