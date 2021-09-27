const SuccessResponse = (message, payload) => {
	const response = {
		status: "success",
		message,
		payload,
	};
	return response;
};

const ErrorResponse = (message) => {
	const response = {
		status: "failure",
		message,
	};
	return response;
};

export { SuccessResponse, ErrorResponse };
