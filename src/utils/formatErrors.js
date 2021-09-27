/* eslint-disable no-param-reassign */
import _ from "lodash";

// Format Joi errors
const joiValidationError = (inputError) => {
	const formattedError = {};
	if (inputError.details) {
		_.forEach(inputError.details, (error) => {
			formattedError[error.context.label] = error.message;
		});
	}
	return formattedError;
};

const mongooseValidationError = (inputError) => {
	const formattedError = _.transform(
		inputError.errors,
		(result, value, _key) => {
			result[value.path] = value.message;
		},
		{},
	);
	return formattedError;
};

export default { joiValidationError, mongooseValidationError };
