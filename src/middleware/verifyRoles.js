import httpError from "http-errors";

import catchAsyncErrors from "./catchAsyncErrors.js";

const verifyRoles = (...roles) =>
	catchAsyncErrors(async (req, res, next) => {
		const { user } = req;
		if (!roles.includes(user.role)) throw httpError(403, "Unauthorized.");
		next();
	});

export default verifyRoles;
