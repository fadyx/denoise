import PostService from "../../services/post.js";

const unlikePost = async (postId, username) => {
	await PostService.unlikePost(postId, username);
};

export default unlikePost;
