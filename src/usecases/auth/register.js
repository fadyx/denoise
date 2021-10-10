import RunUnitOfWork from "../../database/RunUnitOfWork.js";
import userService from "../../services/user.js";

const register = async (userDto) => {
	const uow = async (session) => {
		const user = await userService.registerUser(userDto, { session });
		const refresh = await userService.generateRefreshToken(user, { session });
		const access = await userService.generateAccessToken(user, refresh);
		return { user, tokens: { refresh, access } };
	};
	const registerPayload = await RunUnitOfWork(uow);
	return registerPayload;
};

export default register;
