import PostService from "../../services/post.js";

const getNewsFeedForUser = async (username, type, lastPostId) => {
	const timeline = await PostService.getNewsfeedForUser(username, type, lastPostId);
	return timeline;
};

export default getNewsFeedForUser;
