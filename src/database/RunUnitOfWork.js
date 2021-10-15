import mongoose from "mongoose";

// class UnitOfWork {
// 	constructor(uow) {
// 		this.uow = uow;
// 	}

// 	async run(session) {
// 		if (typeof session === "undefined" || session === null) {
// 			this.session = await mongoose.startSession();
// 			this.session.startTransaction();
// 		} else {
// 			this.session = session;
// 		}

// 		try {
// 			const result = await this.uow(session);
// 			await session.commitTransaction();
// 			return result;
// 		} catch (error) {
// 			await session.abortTransaction();
// 			throw error;
// 		} finally {
// 			await session.endSession();
// 		}
// 	}
// }

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
