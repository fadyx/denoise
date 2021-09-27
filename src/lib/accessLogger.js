/* eslint-disable security/detect-non-literal-fs-filename */
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDirectory = path.join(__dirname, "../../logs/access");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });

const successLogPath = path.join(__dirname, "../../logs/access/success.log");
const failureLogPath = path.join(__dirname, "../../logs/access/failure.log");

const successLogStream = fs.createWriteStream(successLogPath, { flags: "a" });
const failureLogStream = fs.createWriteStream(failureLogPath, { flags: "a" });

morgan.token("message", (req, res) => res.locals.errorMessage || "");

const basicFormat =
	"[:date[clf]] length::res[content-length] HTTP/:http-version :method :url status::status response-time::response-time ms - :remote-user :remote-addr - :user-agent";

const failureFormat = `${basicFormat} - message::message`;
const successFormat = basicFormat;

const successLogger = morgan(successFormat, { stream: successLogStream, skip: (req, res) => res.statusCode >= 400 });
const failureLogger = morgan(failureFormat, { stream: failureLogStream, skip: (req, res) => res.statusCode < 400 });

export { successLogger, failureLogger };
