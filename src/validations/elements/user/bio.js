import Joi from "joi";

const MIN_LENGTH = 0;
const MAX_LENGTH = 500;
const LABEL = "bio";
const DEFAULT = "Hello!";

const bio = Joi.string()
	.trim()
	.min(MIN_LENGTH)
	.normalize("NFKC")
	.max(MAX_LENGTH)
	.default(DEFAULT)
	.label(LABEL)
	.label("Bio")
	.replace(/\n\s*\n/g, "\n")
	.replace(/ {4,}/g, "   ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than 500 characters.",
		"any.required": "{{#label}} is required.",
	});

export { LABEL, DEFAULT, MAX_LENGTH, MIN_LENGTH };
export default bio;
