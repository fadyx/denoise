import path, { dirname } from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import Debug from "debug";

import logger from "../lib/logger.js";

import "../models/index.js";

const debug = Debug("server:database");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __filePath = path.relative(path.dirname(__dirname), __filename);

const log = logger.child({ origin: __filePath });

if (process.env.DEBUG_DB === "true") {
	mongoose.set("debug", true);
}

mongoose.connection.on("connecting", () => {
	debug("Connecting to database...");
});

mongoose.connection.on("error", (error) => {
	debug("Could not connect to database.");
	debug(error);
	log.error(error);
	throw error;
});

mongoose.connection.on("fullsetup", () => {
	debug("Connected to all servers of the replica set.");
});

mongoose.connection.on("connected", () => {
	debug("Connected to database.");
});

mongoose.connection.on("disconnected", () => {
	debug("Connection to database is closed...");
});

mongoose.connection.on("reconnected", () => {
	debug("Reconnected successfully to database...");
});

mongoose.connection.on("close", () => {
	debug("Successfully closed connection with database...");
});

const connect = async () => {
	try {
		await mongoose.connect(process.env.DBURI);
	} catch (error) {
		debug("Could not connect to database.");
		debug(error);
		log.error(error);
		throw error;
	}
};

const disconnect = async () => {
	try {
		await mongoose.connection.close(false);
	} catch (error) {
		debug("Could not disconnect the database connection.");
		debug(error);
		log.error(error);
		throw error;
	}
};

export default { connect, disconnect };
