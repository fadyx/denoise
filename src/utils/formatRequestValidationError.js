import _ from "lodash";

// Format Joi errors
const formatRequestValidationError = (inputError) => {
	const formattedError = {};
	if (inputError.details) {
		_.forEach(inputError.details, (error) => {
			formattedError[error.context.label] = error.message;
		});
	}
	return formattedError;
};

export default formatRequestValidationError;
