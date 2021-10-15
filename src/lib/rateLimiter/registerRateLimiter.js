import mongoose from "mongoose";

import { RateLimiterMongo } from "rate-limiter-flexible";

const registerConsecutiveSuccessesRateLimiterByIpAddress = new RateLimiterMongo({
	storeClient: mongoose.connection,
	points: 4,
	duration: 100,
	blockDuration: 60,
	tableName: "register_limiter",
	inmemoryBlockOnConsumed: 4,
});

export default registerConsecutiveSuccessesRateLimiterByIpAddress;
