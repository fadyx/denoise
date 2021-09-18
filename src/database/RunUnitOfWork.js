import mongoose from "mongoose";

const RunUnitOfWork = async (uow) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const result = await uow(session);
		await session.commitTransaction();
		await session.endSession();
		return result;
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

export default RunUnitOfWork;
