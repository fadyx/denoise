import User from "../models/user.js";
import Post from "../models/post.js";

const createUser = async (userDto) => {
	const user = new User(userDto);
	await user.save();
	return user;
};

const getUserByUsername = async (username) => {
	const user = await User.findOne({ username });
	return user;
};

const deleteUser = async (username) => {
	const session = await User.startSession();
	session.startTransaction();
	try {
		const user = await User.findOne({ username }).session(session);
		user.deleted = true;
		user.token = null;
		await Post.updateMany({ userId: user._id, deleted: false }, { deleted: true }).session(session);
		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

export default { deleteUser, createUser, getUserByUsername };
