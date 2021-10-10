import NotificationService from "../../services/notification.js";

const readAllNotification = async (username) => {
	await NotificationService.markAllNotificationAsReadForUser(username);
};

export default readAllNotification;
