import catchAsync from "./catchAsyncErrors.js";

import createRateLimiterRedis from "../lib/rateLimiter/createRateLimiterRedis.js";

const limitByIp = (endpoint, requests, duration, blockDuration) => {
	const keyPrefix = `ip_rate_limiter_for_endpoint_${endpoint}`;
	const ipRateLimiter = createRateLimiterRedis(keyPrefix, requests, duration, blockDuration);
	return catchAsync(async (req, res, next) => {
		await ipRateLimiter.consume(req.ip);
		next();
	});
};

const limitByUsername = (endpoint, requests, duration, blockDuration) => {
	const keyPrefix = `username_rate_limiter_for_endpoint_${endpoint}`;
	const usernameRateLimiter = createRateLimiterRedis(keyPrefix, requests, duration, blockDuration);
	return catchAsync(async (req, res, next) => {
		await usernameRateLimiter.consume(req.username);
		next();
	});
};

export default { limitByIp, limitByUsername };
