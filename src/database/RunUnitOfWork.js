import mongoose from "mongoose";

const RunUnitOfWork = async (uow, passedSession) => {
	let session;

	if (!passedSession) {
		session = await mongoose.startSession();
		session.startTransaction();
	} else {
		session = passedSession;
	}

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
