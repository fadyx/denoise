import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const rateLimiterMemory = new RateLimiterMemory({
	points: 60,
	duration: 60,
});

const registerConsecutiveFailsRateLimiterByIpAddress = new RateLimiterRedis({
	storeClient: redisClient,
	points: 3, // 3 attempts
	duration: 60, // during 60 seconds
	execEvenly: false,
	blockDuration: 60,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: "register_consecutive_fails_rate_limiter",
});

export default registerConsecutiveFailsRateLimiterByIpAddress;
