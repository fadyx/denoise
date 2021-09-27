import httpError from "http-errors";
import httpStatus from "http-status";

import catchAsyncErrors from "./catchAsyncErrors.js";

const verifyRoles = (...roles) =>
	catchAsyncErrors(async (req, res, next) => {
		const { user } = req;
		if (!roles.includes(user.role)) throw httpError(httpStatus.FORBIDDEN, "forbidden.");
		next();
	});

export default verifyRoles;
