import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import userService from "../../services/user.js";

const login = async (username, password) => {
	const uow = async (session) => {
		const user = await userService.findByCredentials(username, password, { session });
		const refresh = await userService.generateRefreshToken(user, { session });
		const access = await userService.generateAccessToken(user, refresh);
		return { user, tokens: { refresh, access } };
	};
	const loginPayload = await RunUnitOfWork(uow);
	return loginPayload;
};

export default login;
