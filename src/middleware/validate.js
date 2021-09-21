import catchAsyncErrors from "./catchAsyncErrors.js";

const options = {
	abortEarly: false,
	allowUnknown: false,
	errors: {
		wrap: {
			label: "",
		},
	},
};

const validate = (schema) =>
	catchAsyncErrors(async (req, res, next) => {
		await schema.validateAsync(req.body, options);
		return next();
	});

export default validate;
