import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import userService from "../../services/user.js";

const refreshAccessToken = async (username, refreshToken) => {
	const uow = async (session) => {
		const user = await userService.findByUsername(username, { session });
		const access = await userService.generateAccessToken(user, refreshToken);
		return { tokens: { access } };
	};
	const refreshTokenPayload = await RunUnitOfWork(uow);
	return refreshTokenPayload;
};

export default refreshAccessToken;
