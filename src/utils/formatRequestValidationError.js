import _ from "lodash";

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
