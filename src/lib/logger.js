import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import pino from "pino";

const opts = {
	level: "info",
	timestamp: true,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDirectory = path.join(__dirname, "../../logs/operation");

if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });

const loggingFile = path.join(__dirname, "../../logs/operation/operation.log");
const dest = pino.destination({ dest: loggingFile });

const logger = pino(opts, dest);

export default logger;
