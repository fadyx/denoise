import express from "express";
import morgan from "morgan";
import httpError from "http-errors";
import cors from "cors";
import helmet from "helmet";

import routers from "./routes/index.js";
import notFoundController from "./controllers/notFound.js";
import healthController from "./controllers/health.js";

import { successLogger, failureLogger } from "./lib/accessLogger.js";
import error from "./middleware/error.js";

const app = express();

app.set("x-powered-by", false);
app.set("etag", false);
app.set("case sensitive routing", false);
app.set("strict routing", true);

app.use(cors());
app.use(helmet());
app.use(successLogger);
app.use(failureLogger);
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use((req, res, next) => {
	if (req.is("application/json") || !req.get("Content-Type")) return next();
	return next(httpError(406, "invalid request type."));
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
app.get("/api/health", healthController);
app.all("*", notFoundController);
app.use(error.converter);
app.use(error.handler);

export default app;
