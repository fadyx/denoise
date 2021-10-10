import PostService from "../../services/post.js";

const getUserPosts = async (username, lastId) => {
	return PostService.getPostsByUsername(username, lastId);
};

export default getUserPosts;
