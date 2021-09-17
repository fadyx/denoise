import Joi from "joi";

const LABEL = "allow comments";

const allowComments = Joi.boolean().label(LABEL).messages({
	"boolean.base": "{{#label}} is of type boolean.",
	"any.empty": "{{#label}} is required.",
	"any.required": "{{#label}} is required.",
});

export { LABEL };
export default allowComments;
