import { createTerminus } from "@godaddy/terminus";

import db from "../database/database.js";
import redis from "../cache/redis.js";

import Logger from "./logger.js";

const logger = new Logger("terminus");

const mongoDBHealthCheck = () => {
	const state = db.state();
	switch (state) {
		case 0:
			return "DISCONNECTED";
		case 1:
			return "CONNECTED";
		case 2:
			return "CONNECTING";
		case 3:
			return "DISCONNECTING";
		default:
			return "ERROR";
	}
};

const redisDBHealthCheck = () => {
	const connected = redis.state();
	return connected ? "CONNECTED" : "DISCONNECTED";
};

const healthCheck = async ({ state }) => {
	const { isShuttingDown } = state;
	const databaseState = mongoDBHealthCheck();
	const cacheDatabaseState = redisDBHealthCheck();

	return {
		isShuttingDown,
		databaseState,
		cacheDatabaseState,
	};
};

const healthChecks = {
	"/api/health-check": healthCheck,
	verbatim: true,
	__unsafeExposeStackTraces: false,
};

const caseInsensitive = false;
const timeout = 1000;
const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
const sendFailuresDuringShutdown = true;
const statusOk = 200;
const statusError = 503;

function beforeShutdown() {
	logger.debug("Shutdown signal is emitted...");
	return new Promise((resolve) => {
		setTimeout(resolve, 5000);
	});
}

const onSignal = () => {
	logger.debug("Starting a cleanup...");

	// cleanup logic, such as closing database connections
	return Promise.all([db.disconnect(), redis.quit()]);
};

function onShutdown() {
	logger.debug("Cleanup finished, server is down...");
}

const options = {
	healthChecks,
	caseInsensitive,
	timeout,
	signals,
	sendFailuresDuringShutdown,
	statusOk,
	statusError,
	onSignal,
	// onSendFailureDuringShutdown,
	onShutdown,
	beforeShutdown,
	logger: (...messages) => logger.log(...messages),
};

const terminus = (server) => {
	createTerminus(server, options);
};

export default terminus;
