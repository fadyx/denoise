import createHttpError from "http-errors";

import PostService from "../../services/post.js";
import UserService from "../../services/user.js";

const getPostFor = async (postId, username) => {
	const [post, user] = await Promise.all([PostService.getPostById(postId), UserService.findByUsername(username)]);
	if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post not found.");
	const liked = post.isLikedBy(user.username);
	return { ...post.toJSON(), liked };
};

export default getPostFor;
