import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

const redisClient = createClient({ enable_offline_queue: false });

const createRateLimiterRedis = (keyPrefix, requests, duration, blockDuration) => {
	const rateLimiterMemory = new RateLimiterMemory({
		points: requests,
		blockDuration,
		duration,
	});

	const rateLimiter = new RateLimiterRedis({
		storeClient: redisClient,
		points: requests,
		duration,
		execEvenly: false,
		blockDuration,
		insuranceLimiter: rateLimiterMemory,
		keyPrefix,
	});

	return rateLimiter;
};

export default createRateLimiterRedis;
