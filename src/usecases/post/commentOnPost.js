import PostService from "../../services/post.js";

const commentOnPost = async (postId, username, commentDto) => {
	const comment = await PostService.commentOnPostAs(postId, username, commentDto);
	return comment;
};

export default commentOnPost;
