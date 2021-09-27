import Joi from "joi";

import { genders } from "../../../constants/Gender.js";

const LABEL = "gender";

const gender = Joi.string()
	.trim()
	.label(LABEL)
	.valid(...genders)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

export { LABEL };
export default gender;
