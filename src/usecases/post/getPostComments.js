import PostService from "../../services/post.js";

const getPostComments = async (postId, username, lastCommentId) => {
	const comments = await PostService.getCommentsOnPostAs(postId, username, lastCommentId);
	return comments;
};

export default getPostComments;
