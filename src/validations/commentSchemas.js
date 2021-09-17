import Joi from "joi";

import { CommentElements } from "./elements/index.js";

const createCommentSchema = Joi.object({
	text: CommentElements.text.required(),
});

export default { createCommentSchema };
