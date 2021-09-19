import httpError from "http-errors";

import catchAsync from "./catchAsyncErrors.js";

const verifyRoles = (...roles) =>
	catchAsync(async (req, res, next) => {
		const { user } = req;
		if (!roles.includes(user.role)) throw httpError(403, "Unauthorized.");
		next();
	});

export default verifyRoles;
