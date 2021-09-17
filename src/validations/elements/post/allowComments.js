import Joi from "joi";

const LABEL = "allow comments";
const DEFAULT = true;

const allowComments = Joi.boolean().label(LABEL).default(true).messages({
	"boolean.base": "{{#label}} is of type boolean.",
	"any.empty": "{{#label}} is required.",
	"any.required": "{{#label}} is required.",
});

export { LABEL, DEFAULT };
export default allowComments;
