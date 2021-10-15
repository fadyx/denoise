import mongoose from "mongoose";

import { RateLimiterMongo } from "rate-limiter-flexible";

const points = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_SUCCESSES_PER_IP, 10);
const duration = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_SUCCESSES_PER_IP_DURATION, 10);
const blockDuration = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_SUCCESSES_PER_IP_BLOCK_DURATION, 10);

const registerConsecutiveSuccessesRateLimiterByIpAddress = new RateLimiterMongo({
	storeClient: mongoose.connection,
	points,
	duration,
	blockDuration,
	tableName: "register_limiter",
	inmemoryBlockOnConsumed: points,
});

export default registerConsecutiveSuccessesRateLimiterByIpAddress;
