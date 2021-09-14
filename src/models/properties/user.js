const uuid = {
	versions: ["uuidv1", "uuidv2", "uuidv3", "uuidv4", "uuidv5"],
};

const gender = {
	options: ["female", "male", "other", "prefer not to disclose"],
	default: "prefer not to disclose",
};

const age = {
	options: ["0", "15-17", "18-20", "21-25", "26-30", "31-35", "36-40", "41-50", "+50"],
	default: "0",
};

const username = {
	minLength: 5,
	maxLength: 15,
	pattern: /^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
};

const password = {
	minLength: 8,
	maxLength: 32,
};

const displayname = {
	minLength: 1,
	maxLength: 20,
};

const bio = {
	minLength: 1,
	maxLength: 500,
	default: "Hello There!",
};

const location = {
	maxLength: 20,
	minLength: 1,
	default: "Planet Earth.",
};

export default {
	uuid,
	gender,
	age,
	username,
	password,
	displayname,
	bio,
	location,
};
