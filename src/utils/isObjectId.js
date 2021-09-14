import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

const isObjectId = (id) => {
	if (typeof id === "string") return hexadecimal.test(id) && id.length === 24;
	if (id instanceof ObjectId) return ObjectId.isValid(id);
	return false;
};

export default isObjectId;
