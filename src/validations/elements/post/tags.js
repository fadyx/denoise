import Joi from "joi";

import { tags as validTags } from "../../../constants/Tag.js";

const LABEL = "tags";

const tags = Joi.array()
	.label(LABEL)
	.items(
		Joi.string()
			.trim()
			.label("tag")
			.valid(...validTags)
			.messages({
				"string.base": "{{#label}} is of type string.",
				"string.empty": "{{#label}} is required.",
				"any.required": "{{#label}} is required.",
				"any.only": "invalid {{#label}} input.",
			}),
	)
	.unique()
	.max(validTags.length)
	.messages({
		"array.base": "{{#label}} is of type array.",
		"array.max": "{{#label}} is an array of maximum {#limit} tags.",
		"array.unique": "{{#label}} values must be unique.",
	});

export { LABEL };
export default tags;
