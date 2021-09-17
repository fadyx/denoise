import Joi from "joi";

import { PostElements } from "./elements/index.js";

const createPostSchema = Joi.object({
	text: PostElements.text.required(),
	allowComments: PostElements.allowComments.optional(),
	flags: PostElements.flags.optional(),
});

export default { createPostSchema };
