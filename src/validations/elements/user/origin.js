import Joi from "joi";

const MIN_LENGTH = 8;
const MAX_LENGTH = 32;
const LABEL = "origin";

const origin = Joi.string()
	.trim()
	.max(MAX_LENGTH)
	.min(MIN_LENGTH)
	.normalize("NFKC")
	.label(LABEL)
	.replace("\n", " ")
	.replace(/\s\s+/g, " ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than {#limit} characters.",
		"any.required": "{{#label}} is required.",
	});

export { MIN_LENGTH, MAX_LENGTH, LABEL };
export default origin;
