const catchAsync = (handler) => (req, res, next) => {
	Promise.resolve(handler(req, res, next)).catch((error) => next(error));
};

export default catchAsync;
