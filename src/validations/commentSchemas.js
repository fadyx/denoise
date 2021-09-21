import Joi from "joi";

import { CommentElements } from "./elements/index.js";

const create = Joi.object({
	text: CommentElements.text.required(),
});

export default { create };
