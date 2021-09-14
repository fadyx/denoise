import Joi from "joi";

import commentProperties from "../../../models/properties/comment.js";

const commentContent = Joi.string()
	.min(commentProperties.content.minLength)
	.max(commentProperties.content.maxLength)
	.trim()
	.label("comment content")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
	});

/* ██████████████████████████████████████████████████████████████████████████ */

const createCommentSchema = Joi.object({
	content: commentContent.required(),
});

export default { createCommentSchema };
