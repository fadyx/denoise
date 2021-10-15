/* eslint-disable security/detect-non-literal-fs-filename */
import { promisify } from "util";

import { createClient } from "redis";

import Logger from "../lib/logger.js";

const logger = new Logger("redis");

const retryStrategy = (options) => {
	if (options.error && options.error.code === "ECONNREFUSED") {
		return new Error("The server refused the connection");
	}
	if (options.total_retry_time > 1000 * 60 * 60) {
		return new Error("Retry time exhausted");
	}
	if (options.attempt > 10) {
		return undefined;
	}
	return Math.min(options.attempt * 100, 3000);
};

const client = createClient({ url: process.env.REDIS_URL, retry_strategy: retryStrategy });

client.on("error", (error) => {
	logger.debug("failed connecting to redis database.");
	logger.log(error);
	throw error;
});

client.on("end", () => {
	logger.debug("connection to redis database is closed.");
});

client.on("ready", () => {
	logger.debug("connected successfully to redis database...");
});

client.on("reconnecting", () => {
	logger.debug("reconnecting to redis database...");
});

const set = promisify(client.set).bind(client);
const get = promisify(client.get).bind(client);
const mset = promisify(client.mset).bind(client);
const mget = promisify(client.mget).bind(client);
const keys = promisify(client.keys).bind(client);
const exists = promisify(client.exists).bind(client);
const del = promisify(client.del).bind(client);
const rename = promisify(client.rename).bind(client);
const ttl = promisify(client.ttl).bind(client);
const expire = promisify(client.expire).bind(client);
const expireat = promisify(client.expireat).bind(client);
const quit = promisify(client.quit).bind(client);

const state = () => client.connected;

export default {
	commands: { set, get, mset, mget, keys, exists, del, rename, ttl, expire, expireat },
	state,
	quit,
	client,
};
