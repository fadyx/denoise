import { promisify } from "util";
import redis from "redis";

const redisClient = redis.createClient(process.env.REDIS_URI);

redisClient.set = promisify(redisClient.set);
redisClient.get = promisify(redisClient.get);
redisClient.expire = promisify(redisClient.expire);
redisClient.del = promisify(redisClient.del);
redisClient.ttl = promisify(redisClient.ttl);

export default redisClient;
