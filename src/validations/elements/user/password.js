import Joi from "joi";

const MIN_LENGTH = 8;
const MAX_LENGTH = 32;
const LABEL = "password";

const password = Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).label(LABEL).messages({
	"string.base": "{{#label}} is of type string.",
	"string.empty": "{{#label}} is required.",
	"string.min": "{{#label}} must be more that 8 characters.",
	"string.max": "{{#label}} must be less than 64 characters.",
	"any.required": "{{#label}} is required.",
});

export { MIN_LENGTH, MAX_LENGTH, LABEL };
export default password;
