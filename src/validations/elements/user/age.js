import Joi from "joi";

import { Age, ages } from "../../../constants/age.js";

const LABEL = "age";
const DEFAULT = Age.UNSPECIFIED;

const age = Joi.string()
	.trim()
	.label(LABEL)
	.valid(...ages)
	.default(DEFAULT)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

export { LABEL, DEFAULT };
export default age;
