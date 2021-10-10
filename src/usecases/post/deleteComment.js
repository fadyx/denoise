import PostService from "../../services/post.js";

const deleteComment = async (postId, commentId, username) => {
	await PostService.deleteUserOwnComment(postId, commentId, username);
};

export default deleteComment;
