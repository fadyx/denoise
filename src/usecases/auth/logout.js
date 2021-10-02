import httpError from "http-errors";
import httpStatus from "http-status";

import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import UserService from "../../services/user.js";

const logout = async (username, oldRefreshToken) => {
	const uow = async (session) => {
		const user = await UserService.findActiveUserByUsername({ username }, { session });
		if (user.token !== oldRefreshToken) throw httpError(httpStatus.UNAUTHORIZED, "invalid token.");
		user.setRefreshToken(null);
		await user.save({ session });
	};
	await RunUnitOfWork(uow);
};

export default logout;
