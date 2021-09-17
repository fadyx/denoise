import mongoose from "mongoose";

const RunUnitOfWork = async (uow) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		await uow(session);
		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

export default RunUnitOfWork;
