import PostService from "../../services/post.js";

const deleteReply = async (postId, commentId, replyId, username) => {
	await PostService.deleteUserOwnReply(postId, commentId, replyId, username);
};

export default deleteReply;
