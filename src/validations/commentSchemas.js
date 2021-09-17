import Joi from "joi";

import { CommentElements } from "./elements/index.js";

const createComment = Joi.object({
	text: CommentElements.text.required(),
});

export default { createComment };
