import UserService from "../../services/user.js";

const getMyProfile = async (username) => {
	const user = await UserService.findByUsername(username);
	return user;
};

export default getMyProfile;
