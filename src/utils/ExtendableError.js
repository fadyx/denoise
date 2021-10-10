class ExtendableError extends Error {
	constructor({ message, errors, status, isPublic, stack }) {
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.errors = errors;
		this.status = status;
		this.isPublic = isPublic;
		this.stack = stack;
		if (!stack) Error.captureStackTrace(this, this.constructor.name);
	}
}

export default ExtendableError;
