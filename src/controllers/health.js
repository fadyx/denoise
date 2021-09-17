import mongoose from "mongoose";
import httpStatus from "http-status";

const healthController = (req, res, _next) => {
	const status = mongoose.connection.readyState === 1 ? "good" : "bad";
	return res.status(httpStatus.OK).json({ status });
};

export default healthController;
