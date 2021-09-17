import Joi from "joi";

const MIN_LENGTH = 1;
const MAX_LENGTH = 15;
const LABEL = "display name";

const displayname = Joi.string()
	.trim()
	.normalize("NFKC")
	.min(MIN_LENGTH)
	.max(MAX_LENGTH)
	.label(LABEL)
	.replace(/\s\s+/g, " ")
	.replace("\n", " ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than 20 characters.",
		"any.required": "{{#label}} is required.",
	});

export { MIN_LENGTH, MAX_LENGTH, LABEL };

export default displayname;
