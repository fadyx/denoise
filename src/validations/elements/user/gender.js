import Joi from "joi";

import { Gender, genders } from "../../../constants/gender.js";

const LABEL = "gender";
const DEFAULT = Gender.UNSPECIFIED;

const gender = Joi.string()
	.trim()
	.label(LABEL)
	.valid(...genders)
	.default(Gender.UNSPECIFIED)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

export { LABEL, DEFAULT };
export default gender;
