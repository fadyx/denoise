import Joi from "joi";

import Countries from "../../../constants/countries.js";

const LABEL = "country";
const DEFAULT = Countries.EARTH.code;

const country = Joi.string()
	.trim()
	.custom((value, helper) => {
		if (!Countries.isCountryCode(value)) return helper.message("Invalid country code");
		return true;
	})
	.valid(...Countries.codes)
	.default(DEFAULT)
	.normalize("NFKC")
	.label(LABEL)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than {#limit} characters.",
		"any.required": "{{#label}} is required.",
	});

export { LABEL, DEFAULT };
export default country;
