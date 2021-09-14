import { getHashtags } from "../../../src/utils/text/index.js";

describe("extractHashtags", () => {
	test("Should return empty array if input is empty string", () => {
		expect(getHashtags("")).toEqual([]);
	});

	test("Should return empty array if input is not a string", () => {
		expect(getHashtags(1234567890)).toEqual([]);
	});

	test("Should return empty array if input does not contain hashtags", () => {
		const txt = "this is a string #! #... that should # not generate #. any hashtags ###";
		expect(getHashtags(txt)).toEqual([]);
	});

	test("Should return an array of hashtags if input does contain hashtags", () => {
		const txt = "This #string_should #generate #five #hashtags #خمسة";
		const hashtags = ["#string_should", "#generate", "#five", "#hashtags", "#خمسة"];
		expect(getHashtags(txt).sort()).toEqual(hashtags.sort());
	});
});
