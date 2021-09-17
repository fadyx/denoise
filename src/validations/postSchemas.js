import Joi from "joi";

import { PostElements } from "./elements/index.js";

const createPost = Joi.object({
	text: PostElements.text.required(),
	allowComments: PostElements.allowComments.optional(),
	flags: PostElements.flags.optional(),
});

export default { createPost };
