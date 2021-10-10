import httpStatus from "http-status";

import ExtendableError from "./ExtendableError.js";

class ApiError extends ExtendableError {
	constructor({ message, errors, stack, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false }) {
		super({
			message,
			errors,
			status,
			isPublic,
			stack,
		});
	}
}

export default ApiError;
