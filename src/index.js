import http from "http";

import database from "./database/database.js";
import app from "./app.js";
import Logger from "./lib/logger.js";

const logger = new Logger("index");

const port = process.env.PORT || 3013;

app.set("port", port);

const server = http.createServer(app);

async function onListening() {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	logger.debug(`HTTP server is up and running on ${bind}`);
}

async function onClose() {
	logger.debug("Server is shutdown...");
}

async function onError(error) {
	logger.log(error);

	await database.disconnect();

	if (error.syscall !== "listen") throw error;

	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

	switch (error.code) {
		case "EACCES":
			logger.debug(`${bind} requires elevated privileges.`);
			process.exit(1);
		case "EADDRINUSE":
			logger.debug(`${bind} is already in use.`);
			process.exit(2);
		default:
			process.exit(3);
	}
}

server.on("error", onError);
server.on("listening", onListening);
server.on("close", onClose);

process.on("unhandledRejection", async (reason, promise) => {
	logger.debug("Unhandled rejection at promise: ", promise, "reason: ", reason);
	logger.log(reason);
	await database.disconnect();
	await server.close();
	process.exit(7);
});

process.on("uncaughtException", async (error) => {
	logger.debug("Uncaught Exception thrown. Error: ", error);
	logger.log(error);
	await database.disconnect();
	await server.close();
	process.exit(8);
});

const gracefulExit = async () => {
	await database.disconnect();
	await server.close();
	process.exitCode = 0;
};

process.on("SIGINT", gracefulExit);
process.on("SIGTERM", gracefulExit);
process.on("exit", (code) => logger.debug(`Exiting with code: ${code}.`));

const bootstrap = async () => {
	logger.debug(`Starting server v${process.env.npm_package_version}...`);
	logger.debug(`Environment: ${process.env.NODE_ENV}...`);

	try {
		await database.connect();
	} catch (error) {
		logger.log(error);
		process.exit(4);
	}

	try {
		await server.listen(app.get("port"));
	} catch (error) {
		await database.disconnect();
		logger.log(error);
		process.exit(5);
	}
};

bootstrap();
