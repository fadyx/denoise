import httpError from "http-errors";
import httpStatus from "http-status";

import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import AuthService from "../../services/auth.js";
import UserService from "../../services/user.js";

const refreshToken = async (username, oldRefreshToken) => {
	const uow = async (session) => {
		const user = await UserService.findActiveUserByUsername({ username }, { session });
		if (user.token !== oldRefreshToken) throw httpError(httpStatus.UNAUTHORIZED, "invalid token.");
		const access = await AuthService.generateAccessToken({ user });
		return { tokens: { access } };
	};
	const refreshTokenPayload = await RunUnitOfWork(uow);
	return refreshTokenPayload;
};

export default refreshToken;
