import UserService from "../../services/user.js";

const getUserProfile = async (username, requestedUserUsername) => {
	const profile = await UserService.getUserProfileAs(username, requestedUserUsername);
	return profile;
};

export default getUserProfile;
