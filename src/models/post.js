import mongoose from "mongoose";
import _ from "lodash";

import text from "../utils/text.js";

import { flags } from "../constants/Flag.js";

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

		reported: {
			type: Boolean,
			default: false,
			index: true,
		},

		reporters: [
			{
				type: String,
				ref: "User",
				foreignField: "username",
				required: true,
			},
		],
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

PostSchema.statics.getUserPosts = async function getUserPosts(username, lastPostId) {
	const limit = 20;
	const sort = { _id: -1 };
	const match = { deleted: false, username };
	if (lastPostId) match._id = { $lt: mongoose.Types.ObjectId(lastPostId) };

	const userPosts = await this.aggregate([
		{
			$match: { ...match },
		},
		{
			$addFields: {
				isLiked: {
					$cond: [{ $in: [username, "$likes"] }, true, false],
				},
			},
		},
	])
		.sort(sort)
		.limit(limit);

	let hasNextPage = false;
	if (userPosts.length < limit) hasNextPage = true;

	return { posts: userPosts, hasNextPage };
};

const Post = mongoose.model("Post", PostSchema);

export default Post;
