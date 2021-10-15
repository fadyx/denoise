import http from "http";

import database from "./database/database.js";
import redis from "./cache/redis.js";
import app from "./app.js";
import Logger from "./lib/logger.js";
import terminus from "./lib/terminus.js";

const logger = new Logger("index");
const server = http.createServer(app);
const port = app.get("port");
terminus(server);

// server events
async function onListening() {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	logger.debug(`HTTP server is up and running on ${bind}`);
}

async function onClose() {
	logger.debug("Server is closed...");
}

async function onError(error) {
	logger.log(error);

	await database.disconnect();
	await redis.quit();

	if (error.syscall !== "listen") throw error;

	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

	switch (error.code) {
		case "EACCES":
			logger.debug(`${bind} requires elevated privileges.`);
			process.exit(1);
		case "EADDRINUSE":
			logger.debug(`${bind} is already in use.`);
			process.exit(1);
		default:
			process.exit(1);
	}
}

server.on("error", onError);
server.on("listening", onListening);
server.on("close", onClose);

// process events
process.on("unhandledRejection", async (reason, promise) => {
	logger.debug("Unhandled rejection at promise: ", promise, "reason: ", reason);
	logger.log(reason);
	await server.close();
	await database.disconnect();
	await redis.quit();
	process.exit(1);
});

process.on("uncaughtException", async (error) => {
	logger.debug("Uncaught Exception thrown. Error: ", error);
	logger.log(error);
	await server.close();
	await database.disconnect();
	await redis.quit();
	process.exit(1);
});

process.on("exit", (code) => logger.debug(`process exiting with code: ${code}.`));

// start running the server
const bootstrap = async () => {
	logger.debug(`Starting server v${process.env.npm_package_version}...`);
	logger.debug(`Environment: ${process.env.NODE_ENV}...`);

	try {
		await database.connect();
	} catch (error) {
		logger.log(error);
		process.exit(1);
	}

	try {
		await server.listen(app.get("port"));
	} catch (error) {
		await database.disconnect();
		await redis.quit();
		logger.log(error);
		process.exit(1);
	}
};

bootstrap();
