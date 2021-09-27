import Joi from "joi";

import { ages } from "../../../constants/Age.js";

const LABEL = "age";

const age = Joi.string()
	.trim()
	.label(LABEL)
	.valid(...ages)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

export { LABEL };
export default age;
