import Joi from "joi";

import userProperties from "../../../models/properties/user.js";

const uuid = Joi.string().uuid({ version: userProperties.uuid.versions }).label("uuid").messages({
	"string.base": "{{#label}} is of type string.",
	"string.empty": "{{#label}} is required.",
	"string.guid": "invalid {{#label}}.",
	"any.required": "{{#label}} is required.",
});

const username = Joi.string()
	.min(userProperties.username.minLength)
	.max(userProperties.username.maxLength)
	.pattern(userProperties.username.pattern)
	.label("username")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.pattern.base": "Invalid {{#label}} format.",
		"string.min": "{{#label}} must be more that 5 characters.",
		"string.max": "{{#label}} must be less than 15 characters.",
		"any.required": "{{#label}} is required.",
	});

const password = Joi.string()
	.min(userProperties.password.minLength)
	.label("password")
	.max(userProperties.password.maxLength)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.min": "{{#label}} must be more that 8 characters.",
		"string.max": "{{#label}} must be less than 64 characters.",
		"any.required": "{{#label}} is required.",
	});

const displayname = Joi.string()
	.trim()
	.normalize("NFKC")
	.max(userProperties.displayname.maxLength)
	.min(userProperties.displayname.minLength)
	.label("displayname")
	.replace(/\s\s+/g, " ")
	.replace("\n", " ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than 20 characters.",
		"any.required": "{{#label}} is required.",
	});

const bio = Joi.string()
	.trim()
	.normalize("NFKC")
	.max(500)
	.label("Bio")
	.replace(/\n\s*\n/g, "\n")
	.replace(/ {4,}/g, "   ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than 500 characters.",
		"any.required": "{{#label}} is required.",
	});

const location = Joi.string()
	.trim()
	.max(userProperties.location.maxLength)
	.min(userProperties.location.minLength)
	.normalize("NFKC")
	.label("location")
	.replace("\n", " ")
	.replace(/\s\s+/g, " ")
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"string.max": "{{#label}} must be less than {#limit} characters.",
		"any.required": "{{#label}} is required.",
	});

const gender = Joi.string()
	.trim()
	.label("gender")
	.valid(...userProperties.gender.options)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

const age = Joi.string()
	.trim()
	.label("age")
	.valid(...userProperties.age.options)
	.messages({
		"string.base": "{{#label}} is of type string.",
		"string.empty": "{{#label}} is required.",
		"any.required": "{{#label}} is required.",
		"any.only": "invalid {{#label}} input.",
	});

/* ██████████████████████████████████████████████████████████████████████████ */

const signupRequestSchema = Joi.object({
	uuid: uuid.required(),
	username: username.required(),
	password: password.required(),
	displayname: displayname.optional(),
	bio: bio.optional(),
	location: location.optional(),
	gender: gender.optional(),
	age: age.optional(),
});

const loginRequestSchema = Joi.object({
	username: username.required(),
	password: password.required(),
});

const updateProfileRequestSchema = Joi.object({
	displayname: displayname.optional(),
	bio: bio.optional(),
	location: location.optional(),
	gender: gender.optional(),
	age: age.optional(),
})
	.or("displayname", "bio", "location", "gender", "age")
	.messages({
		"object.missing": "update request can not be empty.",
	});

const resetPasswordRequestSchema = Joi.object({
	username: username.required(),
	password: password.required(),
	newpassword: password.label("new password").disallow(Joi.ref("password")).required().messages({
		"any.invalid": "{{#label}} can not be the same as old password.",
	}),
});

const terminateUserRequestSchema = Joi.object({
	password: password.required(),
});

export default {
	signupRequestSchema,
	loginRequestSchema,
	updateProfileRequestSchema,
	resetPasswordRequestSchema,
	terminateUserRequestSchema,
};
