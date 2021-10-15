import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const points = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_FAILURES_PER_IP, 10);
const duration = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_FAILURES_PER_IP_DURATION, 10);
const blockDuration = Number.parseInt(process.env.RATE_LIMITER_REGISTER_MAX_FAILURES_PER_IP_BLOCK_DURATION, 10);

const rateLimiterMemory = new RateLimiterMemory({
	points,
	duration,
	blockDuration,
});

const registerConsecutiveFailsRateLimiterByIpAddress = new RateLimiterRedis({
	storeClient: redisClient,
	points,
	duration,
	blockDuration,
	execEvenly: false,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: "register_consecutive_fails_rate_limiter",
});

export default registerConsecutiveFailsRateLimiterByIpAddress;
