import Joi from "joi";

import text from "../../../utils/text.js";

const MIN_LENGTH = 5;
const MAX_LENGTH = 15;
const LABEL = "username";

const username = Joi.string()
	.min(MIN_LENGTH)
	.max(MAX_LENGTH)
	.custom((value, helper) => {
		if (!text.isValidUsername(value)) return helper.message("Invalid username format");
		return true;
	})
	.label(LABEL)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.pattern.base": "Invalid {{#label}} format.",
		"string.min": "{{#label}} must be more that 5 characters.",
		"string.max": "{{#label}} must be less than 15 characters.",
		"any.required": "{{#label}} is required.",
	});

export { MIN_LENGTH, MAX_LENGTH, LABEL };
export default username;
