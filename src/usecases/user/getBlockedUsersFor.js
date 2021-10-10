import UserService from "../../services/user.js";

const getBlockedUsersFor = async (username) => {
	const blockedUsers = await UserService.getBlockedUsersFor(username);
	return blockedUsers;
};

export default getBlockedUsersFor;
