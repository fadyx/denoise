import Joi from "joi";

import { ReportElements } from "./elements/index.js";

const create = Joi.object({
	reportType: ReportElements.reportType.required(),
	userFeedback: ReportElements.userFeedback.optional(),
});

export default { create };
