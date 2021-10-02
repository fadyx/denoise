import UserService from "../../services/user.js";

const getMyProfile = async (username) => {
	const user = await UserService.findActiveUserByUsername({ username });
	return user;
};

export default getMyProfile;
