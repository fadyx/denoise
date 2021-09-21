import twitter from "twitter-text";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const isValidUsername = (username) => twitter.isValidUsername(username);

const isValidObjectId = (id) => {
	const hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;
	if (typeof id === "string") return hexadecimal.test(id) && id.length === 24;
	if (id instanceof ObjectId) return ObjectId.isValid(id);
	return false;
};

export default { isValidUsername, isValidObjectId };
