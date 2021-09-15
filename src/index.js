import http from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import Debug from "debug";

import database from "./database/database.js";
import app from "./app.js";
import logger from "./lib/logger.js";

const debug = Debug("server:index");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __filePath = path.relative(path.dirname(__dirname), __filename);

const log = logger.child({ origin: __filePath });

const port = process.env.PORT || 3013;

app.set("port", port);

const server = http.createServer(app);

async function onListening() {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	debug(`HTTP server is up and running on ${bind}`);
}

async function onClose() {
	debug("Server is shutdown...");
}

async function onError(error) {
	log.error(error);

	await database.disconnect();

	if (error.syscall !== "listen") throw error;

	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

	switch (error.code) {
		case "EACCES":
			debug(`${bind} requires elevated privileges.`);
			process.exit(1);
		case "EADDRINUSE":
			debug(`${bind} is already in use.`);
			process.exit(2);
		default:
			process.exit(3);
	}
}

server.on("error", onError);
server.on("listening", onListening);
server.on("close", onClose);

process.on("unhandledRejection", async (reason, promise) => {
	debug("Unhandled rejection at promise: ", promise, "reason: ", reason);
	log.error(reason);
	await database.disconnect();
	await server.close();
	process.exit(7);
});

process.on("uncaughtException", async (error) => {
	debug("Uncaught Exception thrown. Error: ", error);
	log.error(error);
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
process.on("exit", (code) => debug(`Exiting with code: ${code}.`));

const bootstrap = async () => {
	debug(`Starting server v${process.env.npm_package_version}...`);
	debug(`Environment: ${process.env.NODE_ENV}...`);

	try {
		await database.connect();
	} catch (error) {
		debug(error);
		log.error(error);
		process.exit(4);
	}

	try {
		await server.listen(app.get("port"));
	} catch (error) {
		await database.disconnect();
		debug(error);
		log.error(error);
		process.exit(5);
	}
};

bootstrap();
