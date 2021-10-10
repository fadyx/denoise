import PostService from "../../services/post.js";

const likePost = async (postId, username) => {
	await PostService.likePost(postId, username);
};

export default likePost;
