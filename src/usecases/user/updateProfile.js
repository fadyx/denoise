import UserService from "../../services/user.js";

const updateProfile = async (username, updates) => {
	const user = await UserService.findByUsernameAndUpdate(username, updates);
	return user;
};

export default updateProfile;
