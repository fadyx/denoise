import createHttpError from "http-errors";
import PostService from "../../services/post.js";
import UserService from "../../services/user.js";

const getUserPostsFor = async (fetcherUsername, fetchedUsername, lastId) => {
	const [user, posts] = await Promise.all([
		UserService.findByUsername(fetchedUsername),
		PostService.getPostsByUsername(fetchedUsername, lastId),
	]);
	if (user.isBlockingOrBlockedBy(fetcherUsername)) throw createHttpError(404, "user is not found.");
	return posts;
};

export default getUserPostsFor;
