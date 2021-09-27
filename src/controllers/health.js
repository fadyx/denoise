import mongoose from "mongoose";
import httpStatus from "http-status";

import { SuccessResponse } from "../utils/apiResponse.js";

const healthController = (req, res, _next) => {
	const status = mongoose.connection.readyState === 1 ? "good" : "bad";

	const payload = { status };
	const response = SuccessResponse("status of server fetched successfully.", payload);
	return res.status(httpStatus.OK).json(response);
};

export default healthController;
