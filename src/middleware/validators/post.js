import postSchemas from "./schemas/post.js";
import commentSchemas from "./schemas/comment.js";

const options = {
	abortEarly: false,
	allowUnknown: false,
	errors: {
		wrap: {
			label: "",
		},
	},
};

const createPost = async (req, res, next) => {
	try {
		req.validRequest = await postSchemas.createPostSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

const createComment = async (req, res, next) => {
	try {
		req.validRequest = await commentSchemas.createCommentSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

export default { createPost, createComment };
