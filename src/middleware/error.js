import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import httpError from "http-errors";
import Joi from "joi";

import Logger from "../lib/logger.js";
import ApiError from "../utils/ApiError.js";
import formatError from "../utils/formatErrors.js";

const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;
const { ValidationError } = Joi;

const logger = new Logger("error handler");

const converter = async (err, req, res, next) => {
	if (!(err instanceof ApiError)) {
		if (err instanceof ValidationError) {
			const formattedError = formatError.joiValidationError(err);
			return next(new ApiError(400, "invalid user input.", formattedError));
		}

		if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError || err instanceof NotBeforeError) {
			return next(new ApiError(401, "invalid token."), { error: err.message });
		}

		if (err instanceof mongoose.Error.ValidationError && err.errors) {
			const formattedError = formatError.mongooseValidationError(err);
			console.log(formattedError);
			return next(new ApiError(400, "invalid user input.", formattedError));
		}

		if (httpError.isHttpError(err)) {
			return next(new ApiError(err.status || 500, err.message));
		}
	}
	return next(err);
};

const handler = async (err, req, res, next) => {
	logger.log(err);
	if (res.headersSent) return next(err);
	if (err instanceof ApiError) return res.status(err.statusCode || 500).json(err);
	return res.status(500).json("internal server error");
};

export default { handler, converter };
