import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const points = Number.parseInt(process.env.RATE_LIMITER_GLOBAL_MAX_REQUESTS_PER_USERNAME, 10);
const duration = Number.parseInt(process.env.RATE_LIMITER_GLOBAL_MAX_REQUESTS_PER_USERNAME_DURATION, 10);
const blockDuration = Number.parseInt(process.env.RATE_LIMITER_GLOBAL_MAX_REQUESTS_PER_USERNAME_BLOCK_DURATION, 10);

const rateLimiterMemory = new RateLimiterMemory({
	points,
	blockDuration,
	duration,
});

const generalUsernameRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	points,
	duration,
	execEvenly: false,
	blockDuration,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: "general_username_rate_limiter",
});

export default generalUsernameRateLimiter;
