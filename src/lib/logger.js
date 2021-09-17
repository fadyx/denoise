import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import Pino from "pino";
import Debug from "debug";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logDirectory = path.join(__dirname, "../../logs/operation");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });
const loggingFile = path.join(__dirname, "../../logs/operation/operation.log");

const dest = Pino.destination({ dest: loggingFile });

const pinoOptions = {
	level: "error",
	timestamp: false,
};

const pino = Pino(pinoOptions, dest);

class Logger {
	constructor(origin) {
		this.debugger = Debug(`server:${origin}`);
		this.logger = pino.child({ origin });
	}

	debug(...messages) {
		messages.forEach((message) => this.debugger(message));
	}

	log(...messages) {
		messages.forEach((message) => {
			this.debugger(message);
			this.logger.error(message);
		});
	}
}

export default Logger;
