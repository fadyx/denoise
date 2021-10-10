import userService from "../../services/user.js";

const logout = async (username, refreshToken) => {
	await userService.logout(username, refreshToken);
};

export default logout;
