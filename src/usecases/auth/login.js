import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import AuthService from "../../services/auth.js";

const login = async (username, password) => {
	const uow = async (session) => {
		const user = await AuthService.login({ username, password }, { session });
		const refresh = await AuthService.generateRefreshToken({ user }, { session });
		const access = await AuthService.generateAccessToken({ user });
		return { user, tokens: { refresh, access } };
	};
	const loginPayload = await RunUnitOfWork(uow);
	return loginPayload;
};

export default login;
