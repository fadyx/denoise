import Joi from "joi";

import { PostElements } from "./elements/index.js";

const create = Joi.object({
	text: PostElements.text.required(),
	allowComments: PostElements.allowComments.optional(),
	flags: PostElements.flags.optional(),
	tags: PostElements.tags.optional(),
});

export default { create };
