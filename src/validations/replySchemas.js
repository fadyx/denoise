import Joi from "joi";

import { ReplyElements } from "./elements/index.js";

const create = Joi.object({
	text: ReplyElements.text.required(),
});

export default { create };
