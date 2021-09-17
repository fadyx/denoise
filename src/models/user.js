import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "lodash";
import createError from "http-errors";

import uniqueErrorPlugin from "../lib/uniqueErrorPlugin.js";
import text from "../utils/text.js";

import * as usernameProperties from "../validations/elements/user/username.js";

import * as bioProperties from "../validations/elements/user/bio.js";
import * as countryProperties from "../validations/elements/user/country.js";
import * as genderProperties from "../validations/elements/user/gender.js";
import * as ageProperties from "../validations/elements/user/age.js";

import { genders } from "../constants/gender.js";
import { ages } from "../constants/age.js";

const SALTROUNDS = 10;

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required."],
			unique: [true, "Username is unavailable."],
			index: true,
			validate: {
				validator(value) {
					return text.isValidUsername(value);
				},
				message: "Invalid username format.",
			},
		},

		password: {
			type: String,
			required: [true, "Password is required."],
		},

		displayname: {
			type: String,
			trim: true,
			required: [true, "Display name is required."],
		},

		bio: {
			type: String,
			trim: true,
			default: bioProperties.DEFAULT,
		},

		country: {
			type: String,
			required: [true, "Country is required."],
			default: countryProperties.DEFAULT,
			trim: true,
		},

		gender: {
			type: String,
			required: [true, "Gender is required."],
			enum: {
				values: genders,
				message: "Invalid gender input.",
			},
			default: genderProperties.DEFAULT,
		},

		age: {
			type: String,
			required: [true, "Age is required."],
			enum: {
				values: ages,
				message: "Invalid age input.",
			},
			default: ageProperties.DEFAULT,
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
		},

		deleted: {
			type: Boolean,
			required: true,
			default: false,
		},

		deletedAt: {
			type: Date,
		},

		banned: {
			type: Boolean,
			required: true,
			default: false,
		},

		bannedAt: {
			type: Date,
		},

		bannedBy: {
			type: mongoose.Types.ObjectId,
			ref: "User",
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
		user.password = await bcrypt.hash(user.password, SALTROUNDS);
	}
	if (user.isModified("followers")) {
		user.followersCounter = user.followers.length;
	}
	next();
});

userSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicUser = _.pick(user.toObject(), [
		"_id",
		"username",
		"displayname",
		"bio",
		"country",
		"gender",
		"age",
		"followersCounter",
		"postsCounter",
		"karmaCounter",
		"createdAt",
	]);

	return publicUser;
};

userSchema.methods.generateRefreshToken = async function generateRefreshToken() {
	const payload = {
		id: this._id,
		username: this.username,
	};
	const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRETKEY, { expiresIn: process.env.JWT_REFRESH_DURATION });
	this.token = token;
	return token;
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
	const payload = {
		id: this._id,
		username: this.username,
	};
	const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRETKEY, { expiresIn: process.env.JWT_ACCESS_DURATION });
	return token;
};

userSchema.statics.findByCredentials = async function findByCredentials(username, password) {
	const user = await this.findByUsername(username);
	if (!user.checkPassword(password)) throw createError("Invalid credentials.");
	return user;
};

userSchema.statics.findActiveUserById = async function findActiveUserById(id) {
	const user = await this.findById(id);
	if (!user || user.deleted || user.banned) throw createError("User is not found.");
	return user;
};

userSchema.statics.findByUsername = async function findByUsername(username) {
	const user = await this.findOne({ username });
	if (!user || user.deleted || user.banned) throw createError("User is not found.");
	return user;
};

userSchema.methods.checkPassword = async function checkPassword(password) {
	const user = this;
	const isPasswordValid = await bcrypt.compare(password, user.password);
	return isPasswordValid;
};

userSchema.methods.removeToken = async function removeToken() {
	const user = this;
	user.token = null;
	await this.save();
};

userSchema.methods.terminate = async function terminate() {
	const user = this;
	user.deleted = true;
	user.token = null;
};

userSchema.methods.isBlocking = function isBlocking(otherUser) {
	const user = this;
	if (user.blocked.includes(otherUser._id)) return true;
	return false;
};

userSchema.methods.isBlockingOrBlockedBy = function isBlockingOrBlockedBy(otherUser) {
	const user = this;
	if (user.id === otherUser.id) return false;
	if (user.isBlocking(otherUser) || otherUser.isBlocking(user)) return true;
	return false;
};

userSchema.methods.isCommunicableWithId = async function isCommunicableWithId(otherUserId) {
	const user = this;
	if (user._id.equals(otherUserId)) return true;
	const otherUser = await mongoose.model("User").findById(otherUserId); //  instead of User.findById
	if (!otherUser || (await user.isBlocking(otherUser)) || (await otherUser.isBlocking(user))) return false;
	return true;
};

userSchema.methods.isFollowing = function isFollowing(otherUser) {
	const user = this;
	if (user.followees.includes(otherUser.id)) return true;
	return false;
};

userSchema.methods.followUser = function followUser(followee) {
	const user = this;

	if (user.isBlockingOrBlockedBy(followee)) throw createError(404, "user is not found.");
	if (user.isFollowing(followee)) throw createError(406, "user is already followed.");

	user.followees.addToSet(followee._id);
	followee.followers.addToSet(user._id);
};

userSchema.methods.unfollowUser = function unfollowUser(followee) {
	const user = this;

	if (user.isBlockingOrBlockedBy(followee)) throw createError(404, "user is not found.");
	if (!user.isFollowing(followee)) throw createError(406, "user is already unfollowed.");

	user.followees.remove(followee._id);
	followee.followers.remove(user._id);
};

userSchema.methods.blockUser = function blockUser(otherUser) {
	const user = this;

	if (user.isBlocking(otherUser)) throw createError(406, "user is already blocked.");
	if (otherUser.isBlocking(user)) throw createError(404, "user is not found.");
	if (user.isFollowing(otherUser)) user.unfollowUser(otherUser);
	if (otherUser.isFollowing(user)) otherUser.unfollowUser(user);

	otherUser.blocking.addToSet(user._id);
	user.blocked.addToSet(otherUser._id);
};

userSchema.methods.unblockUser = function unblockUser(otherUser) {
	const user = this;

	if (otherUser.isBlocking(user)) throw createError(404, "user is not found.");
	if (!user.isBlocking(otherUser)) throw createError(406, "user is already unblocked.");

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

	await user.populate({
		path: "blocked",
		select: "username displayname _id",
	});
};

const User = mongoose.model("User", userSchema);

export default User;
