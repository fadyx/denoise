import mongoose from "mongoose";

import Logger from "../lib/logger.js";

import "../models/index.js";

const logger = new Logger("database");

if (process.env.MONGO_DB_DEBUG === "true") {
	mongoose.set("debug", true);
}

mongoose.connection.on("connecting", () => {
	logger.debug("Connecting to database...");
});

mongoose.connection.on("error", (error) => {
	logger.debug("Could not connect to database.");
	logger.log(error);
	throw error;
});

mongoose.connection.on("fullsetup", () => {
	logger.debug("Connected to all servers of the replica set.");
});

mongoose.connection.on("connected", () => {
	logger.debug("Connected to database.");
});

mongoose.connection.on("disconnected", () => {
	logger.debug("Connection to database is closed...");
});

mongoose.connection.on("reconnected", () => {
	logger.debug("Reconnected successfully to database...");
});

mongoose.connection.on("close", () => {
	logger.debug("Successfully closed connection with database...");
});

const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI);
	} catch (error) {
		logger.debug("Could not connect to database.");
		logger.log(error);
		throw error;
	}
};

const disconnect = async () => {
	try {
		await mongoose.connection.close(false);
	} catch (error) {
		logger.debug("Could not disconnect the database connection.");
		logger.log(error);
		throw error;
	}
};

const state = () => mongoose.connection.readyState;

export default { connect, disconnect, state };
