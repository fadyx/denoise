import mongoose from "mongoose";
import _ from "lodash";

import text from "../utils/text.js";

import { flags } from "../constants/Flag.js";
import { tags } from "../constants/Tag.js";

const { Schema } = mongoose;

const PostSchema = new Schema(
	{
		username: {
			type: String,
			ref: "User",
			foreignField: "username",
			required: [true, "username is required."],
		},

		displayname: {
			type: String,
			required: [true, "display name is required."],
		},

		text: {
			type: String,
			required: [true, "text is required."],
		},

		likes: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		stats: {
			likes: {
				type: Number,
				default: 0,
				index: true,
			},

			comments: {
				type: Number,
				default: 0,
				index: true,
			},
		},

		hashtags: [
			{
				type: String,
				required: [true, "hashtag is required."],
				index: true,
			},
		],

		allowComments: {
			type: Boolean,
			required: true,
			default: true,
		},

		flags: [
			{
				type: String,
				required: [true, "flag is required."],
				enum: {
					values: flags,
					message: "invalid flag input.",
				},
				index: true,
			},
		],

		tags: [
			{
				type: String,
				required: [true, "tag is required."],
				enum: {
					values: tags,
					message: "invalid tag input.",
				},
				index: true,
			},
		],

		subscribers: [
			{
				type: String,
				require: [true, "username is required."],
			},
		],

		deleted: {
			type: Boolean,
			required: true,
			default: false,
			index: true,
		},

		deletedBy: {
			type: String,
			ref: "User",
			foreignField: "username",
			index: true,
		},
	},
	{ timestamps: true },
);

PostSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicPost = _.pick(user.toObject(), [
		"_id",
		"username",
		"displayname",
		"text",
		"stats",
		"hashtags",
		"allowComments",
		"flags",
		"tags",
		"createdAt",
	]);

	return publicPost;
};

PostSchema.pre("save", async function pre(next) {
	const post = this;

	if (post.isNew) {
		const extractedHashtags = text.extractHashtags(post.text);
		post.hashtags = _.uniq(extractedHashtags);
	}

	if (post.isModified("likes")) {
		post.stats.likes = post.likes.length;
	}

	next();
});

PostSchema.methods.isLikedBy = function isLikedBy(username) {
	return this.likes.includes(username);
};

PostSchema.methods.likePostBy = function likePostBy(username) {
	this.likes.addToSet(username);
};

PostSchema.methods.unlikePostBy = function unlikePostBy(username) {
	this.likes.remove(username);
};

PostSchema.methods.markAsDeletedBy = function markAsDeletedBy(deletedBy) {
	this.deleted = true;
	this.deletedBy = deletedBy;
};

const Post = mongoose.model("Post", PostSchema);

export default Post;
