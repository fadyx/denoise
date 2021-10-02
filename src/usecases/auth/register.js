import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import AuthService from "../../services/auth.js";

const register = async (userDto) => {
	const uow = async (session) => {
		const user = await AuthService.register({ userDto }, { session });
		const refresh = await AuthService.generateRefreshToken({ user }, { session });
		const access = await AuthService.generateAccessToken({ user });
		return { user, tokens: { refresh, access } };
	};
	const registerPayload = await RunUnitOfWork(uow);
	return registerPayload;
};

export default register;
