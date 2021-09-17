import jwt from "jsonwebtoken";

import mongoose from "mongoose";
import createError from "http-errors";
import _ from "lodash";
import Logger from "../lib/logger.js";
import formatRequestValidationError from "../utils/formatRequestValidationError.js";

const { TokenExpiredError } = jwt;

const logger = new Logger("error handler");

const errorHandler = async (err, req, res, next) => {
	logger.log(err);

	if (err.name === "ValidationError" && err.isJoi === true) {
		const formattedError = formatRequestValidationError(err);
		return res.status(400).json({ errors: formattedError });
	}

	if (err.name === "JsonWebTokenError") {
		return res.status(400).json({ errors: { token: "invalid token." } });
	}

	if (err instanceof TokenExpiredError) return res.status(400).json({ error: "expired token." });

	if (err instanceof mongoose.Error.ValidationError && err.errors) {
		const formattedError = _.transform(
			err.errors,
			(result, value, _key) => {
				result[value.path] = value.message;
			},
			{},
		);
		return res.status(400).json({ errors: formattedError });
	}

	if (createError.isHttpError(err)) {
		return res.status(err.status || 500).json(err.message);
	}

	if (res.headersSent) {
		return next(err);
	}

	res.status(err.status || 500);
	return res.json();
};

// const errorConverter = (err, req, res, next) => {
// 	let error = err;
// 	if (!(error instanceof ApiError)) {
// 		const statusCode =
// 			error.statusCode || error instanceof mongoose.Error
// 				? httpStatus.BAD_REQUEST
// 				: httpStatus.INTERNAL_SERVER_ERROR;
// 		const message = error.message || httpStatus[statusCode];
// 		error = new ApiError(statusCode, message, false, err.stack);
// 	}
// 	next(error);
// };

export default errorHandler;
