import path, { dirname } from "path";
import { fileURLToPath } from "url";

import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import createError from "http-errors";
import _ from "lodash";
import cors from "cors";
import helmet from "helmet";
import Debug from "debug";

import routers from "./routes/index.js";
import logger from "./lib/logger.js";

import formatRequestValidationError from "./utils/formatRequestValidationError.js";
import accessLogger from "./lib/accessLogger.js";

const debug = Debug("server:app");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __filePath = path.relative(path.dirname(__dirname), __filename);

const log = logger.child({ origin: __filePath });

const app = express();

app.set("x-powered-by", false);
app.set("etag", false);
app.set("case sensitive routing", false);
app.set("strict routing", true);

app.use(cors());
app.use(helmet());
app.use(accessLogger);
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use((req, res, next) => {
	if (req.is("application/json") || req.get("Content-Type") == null) return next();
	return next(createError(406, "Invalid request type."));
});

app.use(
	express.json({
		limit: "50kb",
		verify(req, res, buf, _encoding) {
			JSON.parse(buf);
		},
	}),
);

app.use("/api", routers);

app.get("/api/health", (req, res, _next) => {
	const status = mongoose.connection.readyState === 1 ? "good" : "bad";
	return res.status(200).json({ status });
});

app.use((req, res, next) => {
	next(createError(404, "Route not found."));
});

app.use((err, req, res, next) => {
	debug(err);
	log.warn(err);

	if (err.name === "ValidationError" && err.isJoi === true) {
		const formattedError = formatRequestValidationError(err);
		return res.status(400).json({ errors: formattedError });
	}

	if (err.name === "JsonWebTokenError") {
		return res.status(400).json({ errors: { token: "invalid token." } });
	}

	if (err instanceof mongoose.Error.ValidationError && err.errors) {
		const formattedError = _.transform(
			err.errors,
			(result, value, _key) => {
				result[value.path] = value.message;
			},
			{},
		);
		return res.status(400).json({ errors: formattedError });
	}

	if (createError.isHttpError(err)) {
		return res.status(err.status || 500).json(err.message);
	}

	if (res.headersSent) {
		return next(err);
	}

	res.status(err.status || 500);
	return res.json();
});

export default app;
