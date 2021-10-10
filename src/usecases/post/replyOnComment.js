import PostService from "../../services/post.js";

const replyOnComment = async (postId, commentId, username, replyDto) => {
	const comment = await PostService.replyOnCommentAs(postId, commentId, username, replyDto);
	return comment;
};

export default replyOnComment;
