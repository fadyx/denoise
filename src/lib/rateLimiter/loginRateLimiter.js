import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const points = Number.parseInt(process.env.RATE_LIMITER_LOGIN_MAX_FAILURES_PER_USERNAME, 10);
const duration = Number.parseInt(process.env.RATE_LIMITER_LOGIN_MAX_FAILURES_PER_USERNAME_DURATION, 10);
const blockDuration = Number.parseInt(process.env.RATE_LIMITER_LOGIN_MAX_FAILURES_PER_USERNAME_BLOCK_DURATION, 10);

const rateLimiterMemory = new RateLimiterMemory({
	points,
	blockDuration,
	duration,
});

const loginConsecutiveFailsRateLimiterByUsername = new RateLimiterRedis({
	storeClient: redisClient,
	points,
	duration,
	execEvenly: false,
	blockDuration,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: "login_consecutive_fails_rate_limiter",
});

export default loginConsecutiveFailsRateLimiterByUsername;
