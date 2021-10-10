import PostService from "../../services/post.js";

const getCommentReplies = async (postId, commentId, username, lastReplyId) => {
	const comments = await PostService.getRepliesOnCommentAs(postId, commentId, username, lastReplyId);
	return comments;
};

export default getCommentReplies;
