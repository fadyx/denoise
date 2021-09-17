import httpError from "http-errors";
import httpStatus from "http-status";

const notFoundController = (req, res, next) => {
	return next(httpError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]));
};

export default notFoundController;
