import PostService from "../../services/post.js";

const getPostLikes = async (postId, username) => {
	const likes = await PostService.getPostLikes(postId, username);
	return likes;
};

export default getPostLikes;
