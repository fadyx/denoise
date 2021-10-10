import mongoose from "mongoose";
import bcrypt from "bcrypt";
import _ from "lodash";
import createError from "http-errors";

import uniqueErrorPlugin from "../lib/uniqueErrorPlugin.js";
import validation from "../utils/validation.js";

import { genders } from "../constants/Gender.js";
import { ages } from "../constants/Age.js";
import { Role, roles } from "../constants/Role.js";

const SALT_ROUNDS = 10;

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, "username is required."],
			unique: [true, "username is unavailable."],
			index: true,
			validate: {
				validator(value) {
					return validation.isValidUsername(value);
				},
				message: "invalid username format.",
			},
		},

		token: {
			type: String,
		},

		password: {
			type: String,
			required: [true, "password is required."],
		},

		profile: {
			displayname: {
				type: String,
				trim: true,
				required: true,
			},

			bio: {
				type: String,
				trim: true,
			},

			gender: {
				type: String,
				enum: {
					values: genders,
					message: "invalid gender input.",
				},
			},

			age: {
				type: String,
				enum: {
					values: ages,
					message: "invalid age input.",
				},
			},

			origin: {
				type: String,
			},

			stats: {
				stars: {
					type: Number,
					default: 0,
				},

				posts: {
					type: Number,
					default: 0,
				},

				karma: {
					type: Number,
					default: 1,
				},
			},
		},

		followees: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		followers: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		blocked: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		blocking: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		inactive: {
			type: Boolean,
			required: true,
			default: false,
		},

		inactivatedAt: {
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
			type: String,
			ref: "User",
			foreignField: "username",
		},

		role: {
			type: String,
			required: [true, "role is required."],
			enum: {
				values: roles,
				message: "invalid role input.",
			},
			default: Role.USER,
		},
	},
	{ timestamps: { createdAt: "profile.createdAt" } },
);

userSchema.plugin(uniqueErrorPlugin);

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
		user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
	}
	if (user.isModified("followers")) {
		user.profile.stats.stars = user.followers.length;
	}
	next();
});

userSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicUser = _.pick(user.toObject(), ["username", "profile"]);
	return publicUser;
};

userSchema.methods.isActive = function isActive() {
	return !this.inactive && !this.banned;
};

userSchema.methods.incrementPostsCounter = function incrementPostsCounter() {
	this.profile.stats.posts += 1;
};

userSchema.methods.setToken = function setToken(token) {
	this.token = token;
};

userSchema.methods.setPassword = function setPassword(password) {
	this.password = password;
};

userSchema.methods.terminate = function terminate() {
	this.token = null;
	this.inactive = true;
	this.inactivatedAt = new Date();
};

userSchema.methods.checkPassword = async function checkPassword(password) {
	const user = this;
	const match = await bcrypt.compare(password, user.password);
	return match;
};

userSchema.methods.isBlocking = function isBlocking(username) {
	const user = this;
	return user.blocked.includes(username);
};

userSchema.methods.isBlockedBy = function isBlockedBy(username) {
	const user = this;
	return user.blocking.includes(username);
};

userSchema.methods.isBlockingOrBlockedBy = function isBlockingOrBlockedBy(username) {
	const user = this;
	if (user.username === username) return false;
	return user.isBlockedBy(username) || user.isBlocking(username);
};

userSchema.methods.isFollowing = function isFollowing(username) {
	const user = this;
	return user.followees.includes(username);
};

userSchema.methods.isFollowedBy = function isFollowedBy(username) {
	const user = this;
	return user.followers.includes(username);
};

userSchema.methods.followUser = function followUser(followee) {
	const user = this;

	if (user.isBlockingOrBlockedBy(followee.username)) throw createError(404, "user is not found.");
	if (user.isFollowing(followee.username)) throw createError(406, "user is already followed.");

	user.followees.addToSet(followee.username);
	followee.followers.addToSet(user.username);
};

userSchema.methods.unfollowUser = function unfollowUser(followee) {
	const user = this;

	if (user.isBlockingOrBlockedBy(followee.username)) throw createError(404, "user is not found.");
	if (!user.isFollowing(followee.username)) throw createError(406, "user is already unfollowed.");

	user.followees.remove(followee.username);
	followee.followers.remove(user.username);
};

userSchema.methods.blockUser = function blockUser(other) {
	const user = this;

	if (user.username === other.username) throw createError(406, "cannot block oneself.");
	if (user.isBlocking(other.username)) throw createError(406, "user is already blocked.");
	if (other.isBlocking(user.username)) throw createError(404, "user is not found.");
	if (user.isFollowing(other.username)) user.unfollowUser(other);
	if (other.isFollowing(user.username)) other.unfollowUser(user);

	other.blocking.addToSet(user.username);
	user.blocked.addToSet(other.username);
};

userSchema.methods.unblockUser = function unblockUser(other) {
	const user = this;

	if (user.username === other.username) throw createError(406, "cannot unblock oneself.");
	if (other.isBlocking(user.username)) throw createError(404, "user is not found.");
	if (!user.isBlocking(other.username)) throw createError(406, "user is already unblocked.");

	other.blocking.remove(user.username);
	user.blocked.remove(other.username);
};

userSchema.methods.logout = function logout() {
	this.token = null;
};

const User = mongoose.model("User", userSchema);

export default User;
