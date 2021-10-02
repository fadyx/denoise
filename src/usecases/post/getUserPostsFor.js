import PostService from "../../services/post.js";
import UserService from "../../services/user.js";

const getUserPostsFor = async (fetchedForUsername, fetchedFromUsername, lastId) => {
	const user = await UserService.findActiveUserByUsernameAs({
		username: fetchedFromUsername,
		asUsername: fetchedForUsername,
	});
	return PostService.getPostsByUsername({ username: user.username, lastId });
};

export default getUserPostsFor;
