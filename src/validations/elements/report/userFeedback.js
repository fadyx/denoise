import Joi from "joi";

const MIN_LENGTH = 1;
const MAX_LENGTH = 500;
const LABEL = "user feedback";

const text = Joi.string()
	.min(MIN_LENGTH)
	.max(MAX_LENGTH)
	.trim()
	.normalize("NFKC")
	.replace(/\n\s*\n/g, "\n")
	.label(LABEL)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than {#limit} characters.",
		"any.required": "{{#label}} is required.",
	});

export { MIN_LENGTH, MAX_LENGTH, LABEL };
export default text;
