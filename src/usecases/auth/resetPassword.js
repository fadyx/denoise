import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import userService from "../../services/user.js";

const resetPassword = async (username, password, newPassword) => {
	const uow = async (session) => {
		const user = await userService.resetPassword(username, password, newPassword, { session });
		const refresh = await userService.generateRefreshToken(user, { session });
		const access = await userService.generateAccessToken(user, refresh);
		return { user, tokens: { refresh, access } };
	};
	const loginPayload = await RunUnitOfWork(uow);
	return loginPayload;
};

export default resetPassword;
