const SuccessResponse = (message, data) => {
	const response = {
		status: "success",
		message,
		data,
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
