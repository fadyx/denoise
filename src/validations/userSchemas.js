import Joi from "joi";

import { UserElements } from "./elements/index.js";

const signupRequestSchema = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
	displayName: UserElements.displayName.optional(),
	bio: UserElements.bio.optional(),
	origin: UserElements.origin.optional(),
	country: UserElements.country.optional(),
	gender: UserElements.gender.optional(),
	age: UserElements.age.optional(),
});

const loginRequestSchema = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
});

const updateProfileRequestSchema = Joi.object({
	displayName: UserElements.displayName.optional(),
	bio: UserElements.bio.optional(),
	origin: UserElements.origin.optional(),
	gender: UserElements.gender.optional(),
	country: UserElements.country.optional(),
	age: UserElements.age.optional(),
})
	.or("displayNme", "bio", "origin", "gender", "age", "country")
	.messages({
		"object.missing": "update request can not be empty.",
	});

const resetPasswordRequestSchema = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
	newPassword: UserElements.password.label("new password").disallow(Joi.ref("password")).required().messages({
		"any.invalid": "{{#label}} can not be the same as old password.",
	}),
});

const terminateUserRequestSchema = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
});

export default {
	signupRequestSchema,
	loginRequestSchema,
	updateProfileRequestSchema,
	resetPasswordRequestSchema,
	terminateUserRequestSchema,
};
