/* eslint-disable security/detect-object-injection */
import mongoose from "mongoose";

const { ValidatorError, ValidationError } = mongoose.Error;

const errorRegex = /index: (.+) dup key:/;
const indexesCache = {};

const getValueByPath = (document, path) => {
	const splitPath = path.split(".");
	let value = document;

	for (let i = 0; i < splitPath.length && value !== null && value !== undefined; i += 1) {
		value = value[splitPath[i]];
	}
	return value;
};

export default (schema) => {
	async function postHook(error, _, next) {
		const doc = this;

		if (
			error &&
			(error.name === "BulkWriteError" || error.name === "MongoServerError") &&
			(error.code === 11000 || error.code === 11001)
		) {
			const { collection } = doc;

			const matches = errorRegex.exec(error.message);

			if (matches) {
				const indexName = matches[1];

				let indexes;
				if (indexesCache[collection.name]) {
					indexes = indexesCache[collection.name];
				} else {
					indexes = await collection.indexInformation();
					indexesCache[collection.name] = indexes;
				}

				const suberrors = {};

				if (indexName in indexes) {
					indexes[indexName].forEach((field) => {
						const path = field[0];

						const props = {
							type: "unique",
							path,
							value: getValueByPath(doc, path),
							message: "Not available.",
						};
						suberrors[path] = new ValidatorError(props);
					});
				}

				const beautifiedError = new ValidationError();
				beautifiedError.errors = suberrors;
				next(beautifiedError);
			}
		} else {
			next(error);
		}
	}

	schema.post("save", postHook);
	schema.post("update", postHook);
	schema.post("findOneAndUpdate", postHook);
};
