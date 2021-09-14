import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import morgan from "morgan";

// To rotate log files
// const rfs = require("rotating-file-stream");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDirectory = path.join(__dirname, "../../logs/access");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });

// const rfsOptions = {
//    size: "10M",
//    interval: "1d",
//    immutable: true,
//    path: logDirectory,
// };

// const accessLogStream = rfs.createStream("access.log", rfsOptions);

const accessLogPath = path.join(__dirname, "../../logs/access/access.log");

const accessLogStream = fs.createWriteStream(accessLogPath, { flags: "a" });

const loggerFormat =
	"[:date[clf]] length::res[content-length] HTTP/:http-version :method :url status::status response-time::response-time ms - :remote-user :remote-addr - :user-agent";

const loggerOptions = {
	stream: accessLogStream,
};

const accessLogger = morgan(loggerFormat, loggerOptions);

export default accessLogger;
