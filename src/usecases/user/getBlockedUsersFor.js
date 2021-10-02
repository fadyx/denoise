import UserService from "../../services/user.js";

const getBlockedUsersFor = async (username) => {
	const user = await UserService.findActiveUserByUsername({ username });
	return user;
};

export default getBlockedUsersFor;
