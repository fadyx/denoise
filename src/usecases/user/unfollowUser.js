import UserService from "../../services/user.js";

const unfollowUser = async (followerUsername, followeeUsername) => {
	await UserService.unfollowUser(followerUsername, followeeUsername);
};

export default unfollowUser;
