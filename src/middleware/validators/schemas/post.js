import Joi from "joi";

import postProperties from "../../../models/properties/post.js";

const postContent = Joi.string()
	.min(postProperties.content.minLength)
	.max(postProperties.content.maxLength)
	.trim()
	.normalize("NFKC")
	.replace(/\n\s*\n/g, "\n")
	.label("post content")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than {#limit} characters.",
		"any.required": "{{#label}} is required.",
	});

const allowComments = Joi.boolean().label("allow comments boolean").messages({
	"boolean.base": "{{#label}} is of type boolean.",
	"any.empty": "{{#label}} is required.",
	"any.required": "{{#label}} is required.",
});

const flags = Joi.array()
	.label("flags")
	.items(
		Joi.string()
			.trim()
			.label("flag")
			.valid(...postProperties.flags.options)
			.messages({
				"string.base": "{{#label}} is of type string.",
				"string.empty": "{{#label}} is required.",
				"any.required": "{{#label}} is required.",
				"any.only": "invalid {{#label}} input.",
			}),
	)
	.unique()
	.max(postProperties.flags.options.length)
	.messages({
		"array.base": "{{#label}} is of type array.",
		"array.max": "{{#label}} is an array of maximum {#limit} flags.",
		"array.unique": "{{#label}} values must be unique.",
	});

/* ██████████████████████████████████████████████████████████████████████████ */

const createPostSchema = Joi.object({
	content: postContent.required(),
	allowComments: allowComments.optional(),
	flags: flags.optional(),
});

export default { createPostSchema };
