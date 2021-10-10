import UserService from "../../services/user.js";

const unblockUser = async (blockerUsername, blockedUsername) => {
	await UserService.unblockUser(blockerUsername, blockedUsername);
};

export default unblockUser;
