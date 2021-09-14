import userSchemas from "./schemas/user.js";

const options = {
	abortEarly: false,
	allowUnknown: false,
	errors: {
		wrap: {
			label: "",
		},
	},
};

const signup = async (req, res, next) => {
	try {
		req.validRequest = await userSchemas.signupRequestSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

const login = async (req, res, next) => {
	try {
		req.validRequest = await userSchemas.loginRequestSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

const updateProfile = async (req, res, next) => {
	try {
		req.validRequest = await userSchemas.updateProfileRequestSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

const resetPassword = async (req, res, next) => {
	try {
		req.validRequest = await userSchemas.resetPasswordRequestSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

const terminateUser = async (req, res, next) => {
	try {
		req.validRequest = await userSchemas.terminateUserRequestSchema.validateAsync(req.body, options);
		return next();
	} catch (error) {
		return next(error);
	}
};

export default { signup, login, updateProfile, resetPassword, terminateUser };
