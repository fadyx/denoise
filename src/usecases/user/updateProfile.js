import UserService from "../../services/user.js";

const updateProfile = async (username, updates) => {
	const user = await UserService.findActiveUserByUsernameAndUpdate({ username, updates });
	return user;
};

export default updateProfile;
