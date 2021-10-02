import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import AuthService from "../../services/auth.js";

const resetPassword = async (username, password, newPassword) => {
	const uow = async (session) => {
		const user = await AuthService.login({ username, password }, { session });
		await AuthService.resetPassword({ user, newPassword }, { session });
		const refresh = await AuthService.generateRefreshToken({ user }, { session });
		const access = await AuthService.generateAccessToken({ user });
		return { user, tokens: { refresh, access } };
	};
	const loginPayload = await RunUnitOfWork(uow);
	return loginPayload;
};

export default resetPassword;
