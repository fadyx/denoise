const options = {
	abortEarly: false,
	allowUnknown: false,
	errors: {
		wrap: {
			label: "",
		},
	},
};

const validate = (schema) => async (req, res, next) => {
	try {
		await schema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

export default validate;
