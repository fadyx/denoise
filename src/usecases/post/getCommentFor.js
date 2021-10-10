import createHttpError from "http-errors";

import PostService from "../../services/post.js";
import UserService from "../../services/user.js";

const getCommentFor = async (postId, commentId, username) => {
	const [post, comment, user] = await Promise.all([
		PostService.getPostById(postId),
		PostService.getCommentById(commentId),
		UserService.findByUsername(username),
	]);
	if (user.isBlockingOrBlockedBy(post.username)) throw createHttpError(404, "post not found.");
	if (user.isBlockingOrBlockedBy(comment.username)) throw createHttpError(404, "comment not found.");
	return comment;
};

export default getCommentFor;
