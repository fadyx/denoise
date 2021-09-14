import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import createError from "http-errors";

const User = mongoose.model("User");

const auth = async (req, res, next) => {
	try {
		const paths = ["/me/terminate"];

		let select;
		if (paths.includes(req.path)) select = "+password";

		if (!req.headers.authorization || req.headers.authorization.split(" ").shift() !== "Bearer")
			return next(createError(401, "unauthenticated."));

		const token = req.headers.authorization.split(" ").pop();
		const decodedToken = jwt.verify(token, process.env.JWTSECRETKEY);

		const user = await User.findOne({
			_id: decodedToken._id,
			token,
		})
			.select(select)
			.exec();

		if (!user) return next(createError("Invalid token."));

		req.user = user;

		return next();
	} catch (error) {
		return next(error);
	}
};

export default auth;
