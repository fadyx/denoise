import generalIpRateLimiter from "../lib/rateLimiter/generalIPRateLimiter.js";
import generalUsernameRateLimiter from "../lib/rateLimiter/generalUsernameRateLimiter.js";

import catchAsync from "./catchAsyncErrors.js";

const limitByIp = catchAsync(async (req, res, next) => {
	await generalIpRateLimiter.consume(req.ip);
	next();
});

const limitByUsername = catchAsync(async (req, res, next) => {
	await generalUsernameRateLimiter.consume(req.username);
	next();
});

export default { limitByIp, limitByUsername };
