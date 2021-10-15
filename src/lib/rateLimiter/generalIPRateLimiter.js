import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const rateLimiterMemory = new RateLimiterMemory({
	points: 100,
	duration: 1,
});

const generalIpRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	points: 100, // attempts
	duration: 1, // during seconds
	execEvenly: false,
	blockDuration: 60,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: "general_ip_rate_limiter",
});

export default generalIpRateLimiter;
