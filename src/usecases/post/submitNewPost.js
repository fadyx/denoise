import PostService from "../../services/post.js";

const submitNewPost = async (postDto, username) => {
	const post = await PostService.submitNewPostAs(postDto, username);
	return post;
};

export default submitNewPost;
