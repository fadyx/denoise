import Joi from "joi";

import { UserElements } from "./elements/index.js";

const register = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
	displayname: UserElements.displayname.optional(),
	bio: UserElements.bio.optional(),
	origin: UserElements.origin.optional(),
	country: UserElements.country.optional(),
	gender: UserElements.gender.optional(),
	age: UserElements.age.optional(),
});

const login = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
});

const resetPassword = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
	newPassword: UserElements.password.label("new password").disallow(Joi.ref("password")).required().messages({
		"any.invalid": "{{#label}} can not be the same as old password.",
	}),
});

const terminate = Joi.object({
	username: UserElements.username.required(),
	password: UserElements.password.required(),
});

export default {
	register,
	login,
	resetPassword,
	terminate,
};
