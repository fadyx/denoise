import Joi from "joi";

const MIN_LENGTH = 1;
const MAX_LENGTH = 500;
const LABEL = "reply text";

const text = Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).trim().label(LABEL).messages({
	"string.base": "{{#label}} is of type string.",
	"string.empty": "{{#label}} is required.",
	"any.required": "{{#label}} is required.",
});

export { MIN_LENGTH, MAX_LENGTH, LABEL };
export default text;
