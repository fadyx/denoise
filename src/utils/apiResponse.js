const SuccessResponse = (message, payload) => {
	const response = {
		status: "success",
		message,
		payload,
	};
	return response;
};

const ErrorResponse = (message, errors) => {
	const response = {
		status: "failure",
		message,
		errors,
	};
	return response;
};

export { SuccessResponse, ErrorResponse };
