import Joi from "joi";

import { reportTypes } from "../../../constants/ReportType.js";

const LABEL = "flags";

const reportType = Joi.string()
	.trim()
	.label("reportType")
	.valid(...reportTypes)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

export { LABEL };
export default reportType;
