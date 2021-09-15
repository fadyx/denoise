import mongoose from "mongoose";

import isObjectId from "../../../src/utils/isObjectId.js";

const { ObjectId } = mongoose.Types;

describe("isValidObjectId function", () => {
	test("Should return false for invalid string ObjectId", () => {
		const id = "not1valid2id";
		expect(isObjectId(id)).toBe(false);
	});

	test("Should return false for invalid long string ObjectId", () => {
		const id = "5ca44444cf0d4447fa60f5e45ca44444cf0d4447fa60f5e45ca44444cf0d4447fa60f5e4";
		expect(isObjectId(id)).toBe(false);
	});

	test("Should return false for invalid type ObjectId", () => {
		const id = 1234567890;
		expect(isObjectId(id)).toBe(false);
	});

	test("Should return true for valid string ObjectId", () => {
		const id = "5ca44444cf0d4447fa60f5e4";
		expect(isObjectId(id)).toBe(true);
	});

	test("Should return true for valid ObjectId", () => {
		const id = new ObjectId();
		expect(isObjectId(id)).toBe(true);
	});
});
