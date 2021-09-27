import Joi from "joi";

import { flags as validFlags } from "../../../constants/Flag.js";

const LABEL = "flags";

const flags = Joi.array()
	.label(LABEL)
	.items(
		Joi.string()
			.trim()
			.label("flag")
			.valid(...validFlags)
			.messages({
				"string.base": "{{#label}} is of type string.",
				"string.empty": "{{#label}} is required.",
				"any.required": "{{#label}} is required.",
				"any.only": "invalid {{#label}} input.",
			}),
	)
	.unique()
	.max(validFlags.length)
	.messages({
		"array.base": "{{#label}} is of type array.",
		"array.max": "{{#label}} is an array of maximum {#limit} flags.",
		"array.unique": "{{#label}} values must be unique.",
	});

export { LABEL };
export default flags;
