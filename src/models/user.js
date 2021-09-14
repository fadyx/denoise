import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "lodash";
import createError from "http-errors";

import uniqueErrorPlugin from "../lib/uniqueErrorPlugin.js";
import userProperties from "./properties/user.js";

const saltRounds = 10;

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required."],
			unique: [true, "Username is not available."],
			index: true,
			validate: {
				validator(value) {
					return userProperties.username.pattern.test(value);
				},
				message: "Invalid username format.",
			},
		},

		password: {
			type: String,
			required: [true, "Password is required."],
			// select: false,
		},

		uuid: {
			type: String,
			required: [true, "UUID is required."],
			index: true,
		},

		displayname: {
			type: String,
			trim: true,
			required: [true, "Display name is required."],
			maxlength: [userProperties.displayname.maxLength, "Display name cannot exceed 20 characters."],
			minlength: [userProperties.displayname.minLength, "Display name cannot be empty."],
		},

		bio: {
			type: String,
			maxlength: [userProperties.bio.maxLength, "Bio cannot exceed 500 characters."],
			minlength: [userProperties.bio.minLength, "Bio cannot be empty."],
			trim: true,
			default: userProperties.bio.default,
		},

		location: {
			type: String,
			required: [true, "Location is required."],
			maxlength: [userProperties.location.maxLength, "Location cannot exceed 30 characters."],
			minlength: [userProperties.location.minLength, "Location cannot be empty"],
			trim: true,
			default: userProperties.location.default,
		},

		gender: {
			type: String,
			required: [true, "Gender is required."],
			enum: {
				values: userProperties.gender.options,
				message: "Invalid gender input.",
			},
			default: userProperties.gender.default,
		},

		age: {
			type: String,
			required: [true, "Age is required."],
			enum: {
				values: userProperties.age.options,
				message: "Invalid age input.",
			},
			default: userProperties.age.default,
		},

		followees: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "User ID is required."],
				ref: "User",
			},
		],

		followers: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "User ID is required."],
				ref: "User",
			},
		],

		blocked: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "User ID is required."],
				ref: "User",
			},
		],

		blocking: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "User ID is required."],
				ref: "User",
			},
		],

		blockedWithUUIDS: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "User ID is required."],
				ref: "User",
			},
		],

		blockedUUIDS: [
			{
				type: String,
				required: [true, "UUID is required."],
				index: true,
			},
		],

		followersCounter: {
			type: Number,
			default: 0,
		},

		postsCounter: {
			type: Number,
			default: 0,
		},

		karmaCounter: {
			type: Number,
			default: 1,
		},

		token: {
			type: String,
			// select: false,
		},

		deleted: {
			type: Boolean,
			required: true,
			default: false,
		},

		banned: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true, typePojoToMixed: false },
);

userSchema.plugin(uniqueErrorPlugin);

userSchema.virtual("posts", {
	ref: "Post",
	localField: "_id",
	foreignField: "userId",
});

userSchema.set("toObject", { virtuals: true, getters: true });
userSchema.set("toJSON", { virtuals: true, getters: true });

userSchema.pre("validate", async function pre(next) {
	const user = this;
	if (user.isNew && !user.displayname) {
		user.displayname = user.username;
	}
	next();
});

userSchema.pre("save", async function pre(next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, saltRounds);
	}
	if (user.isModified("followers")) {
		user.followersCounter = user.followers.length;
	}
	next();
});

userSchema.pre(/^find/, async function pre(next) {
	this.find({ banned: false, deleted: false });
	// this.populate({ path: "posts", select: "-location -address" });
	next();
});

userSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicUser = _.pick(user.toObject(), [
		"_id",
		"username",
		"displayname",
		"bio",
		"location",
		"gender",
		"age",
		"followersCounter",
		"postsCounter",
		"karmaCounter",
		"createdAt",
	]);

	return publicUser;
};

userSchema.statics.findByCredentials = async function findByCredentials(username, password) {
	const validationError = new mongoose.Error.ValidationError(null);
	validationError.addError(
		"credentials",
		new mongoose.Error.ValidatorError({
			message: "Invalid username or password.",
		}),
	);

	const user = await this.findOne({ username }).exec();

	if (!user) throw validationError;

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) throw validationError;

	return user;
};

userSchema.methods.checkPassword = async function checkPassword(password) {
	const user = this;
	const isPasswordValid = await bcrypt.compare(password, user.password);
	return isPasswordValid;
};

userSchema.methods.logout = async function logout() {
	const user = this;
	user.token = null;
};

userSchema.methods.deleteUser = async function deleteUser() {
	const user = this;
	user.deleted = true;
	await this.logout();
};

userSchema.methods.generateAuthToken = async function generateAuthToken() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWTSECRETKEY);
	user.token = token;
	return token;
};

userSchema.methods.updateProfile = async function updateProfile(updates) {
	const user = this;
	_.assign(user, updates);
};

userSchema.methods.isBlocking = async function isBlocking(otherUser) {
	const user = this;
	if (user.blocked.includes(otherUser._id) || user.blockedWithUUIDS.includes(otherUser._id)) return true;
	return false;
};

userSchema.methods.isCommunicableWith = async function isCommunicableWith(otherUser) {
	const user = this;
	if (user.id === otherUser.id) return true;
	if ((await user.isBlocking(otherUser)) || (await otherUser.isBlocking(user))) return false;
	return true;
};

userSchema.methods.isCommunicableWithId = async function isCommunicableWithId(otherUserId) {
	const user = this;
	if (user._id.equals(otherUserId)) return true;
	const otherUser = await mongoose.model("User").findById(otherUserId); //  instead of User.findById
	if (!otherUser || (await user.isBlocking(otherUser)) || (await otherUser.isBlocking(user))) return false;
	return true;
};

userSchema.methods.isFollowing = async function isFollowing(otherUser) {
	const user = this;
	if (user.followees.includes(otherUser._id)) return true;
	return false;
};

userSchema.methods.followUser = async function followUser(followee) {
	const user = this;

	if (!(await user.isCommunicableWith(followee))) throw createError(404, "user is not found.");
	if (await user.isFollowing(followee)) throw createError(406, "user is already followed.");

	user.followees.addToSet(followee._id);
	followee.followers.addToSet(user._id);
};

userSchema.methods.unfollowUser = async function unfollowUser(followee) {
	const user = this;

	if (!(await user.isCommunicableWith(followee))) throw createError(404, "user is not found.");
	if (!(await user.isFollowing(followee))) throw createError(406, "user is already unfollowed.");

	user.followees.remove(followee._id);
	followee.followers.remove(user._id);
};

userSchema.methods.blockUser = async function blockUser(otherUser) {
	const user = this;

	if (await user.isBlocking(otherUser)) throw createError(406, "user is already blocked.");
	if (await otherUser.isBlocking(user)) throw createError(404, "user is not found.");
	if (await user.isFollowing(otherUser)) await user.unfollowUser(otherUser);
	if (await otherUser.isFollowing(user)) await otherUser.unfollowUser(user);

	otherUser.blocking.addToSet(user._id);
	user.blocked.addToSet(otherUser._id);
};

userSchema.methods.uuidBlockUser = async function uuidBlockUser(otherUser) {
	const user = this;

	if (await user.isBlocking(otherUser)) user.unblockUser(otherUser);
	if (await otherUser.isBlocking(user)) otherUser.unblockUser(user);
	if (await user.isFollowing(otherUser)) await user.unfollowUser(otherUser);
	if (await otherUser.isFollowing(user)) await otherUser.unfollowUser(user);

	otherUser.blocking.addToSet(user._id);
	user.blockedWithUUIDS.addToSet(otherUser._id);
};

userSchema.methods.unblockUser = async function unblockUser(otherUser) {
	const user = this;

	if (await otherUser.isBlocking(user)) throw createError(404, "user is not found.");
	if (!(await user.isBlocking(otherUser))) throw createError(406, "user is already unblocked.");
	otherUser.blocking.remove(user._id);
	user.blocked.remove(otherUser._id);
};

userSchema.methods.getUserPosts = async function getUserPosts(lastPostId) {
	const user = this;

	const match = { deleted: false };

	if (lastPostId) {
		match._id = { $lt: lastPostId };
	}

	await user
		.populate({
			path: "posts",
			match,
			options: {
				limit: 15,
				sort: {
					_id: -1,
				},
			},
		})
		.execPopulate();
};

userSchema.methods.populateBlocked = async function populateBlocked() {
	const user = this;

	await user
		.populate({
			path: "blocked",
			select: "username displayname _id",
		})
		.execPopulate();
};

const User = mongoose.model("User", userSchema);

export default User;
