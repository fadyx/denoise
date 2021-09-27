import mongoose from "mongoose";

const RunUnitOfWork = async (uow) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const result = await uow(session);
		await session.commitTransaction();
		return result;
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		await session.endSession();
	}
};

export default RunUnitOfWork;
