import Joi from "joi";

import { UserElements } from "./elements/index.js";

const update = Joi.object({
	displayname: UserElements.displayname.optional(),
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

export default {
	update,
};
