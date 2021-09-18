import mongoose from "mongoose";
import twitter from "twitter-text";

import _ from "lodash";

import { flags } from "../constants/flag.js";

const { Schema } = mongoose;

const PostSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "user id is required."],
			index: true,
		},

		username: {
			type: String,
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

		lovers: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "user id is required."],
				ref: "User",
			},
		],

		loversCounter: {
			type: Number,
			default: 0,
			index: true,
		},

		commentsCounter: {
			type: Number,
			default: 0,
			index: true,
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
	},
	{ timestamps: true },
);

PostSchema.virtual("loversPreviews", {
	ref: "User",
	localField: "lovers",
	foreignField: "_id",
});

PostSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicPost = _.pick(user.toObject(), [
		"_id",
		"deleted",
		"userId",
		"lovers",
		"updatedAt",
		"__v",
		"username",
		"displaymame",
		"flags",
		"allowComments",
		"hashtags",
		"loversCounter",
		"commentsCounter",
		"text",
		"createdAt",
	]);

	return publicPost;
};

PostSchema.set("toObject", { virtuals: true, getters: true });
PostSchema.set("toJSON", { virtuals: true, getters: true });

PostSchema.pre("save", async function pre(next) {
	const post = this;

	if (post.isNew) {
		const extractedHashtags = twitter.extractHashtags(post.text);
		post.hashtags = _.uniq(extractedHashtags);
	}

	if (post.isModified("lovers")) {
		post.loversCounter = post.lovers.length;
	}

	next();
});

PostSchema.pre(/^find/, async function pre(next) {
	this.find({ deleted: false });
	this.populate({ path: "loversPreviews", select: "username displayname" });
	next();
});

PostSchema.statics.getUserPosts = async function getUserPosts(userId, lastPostId) {
	const limit = 20;
	const sort = { _id: -1 };
	const match = { deleted: false, userId };
	if (lastPostId) match._id = { $lt: mongoose.Types.ObjectId(lastPostId) };

	const userPosts = await this.aggregate([
		{
			$match: { ...match },
		},
		{
			$addFields: {
				isLoved: {
					$cond: [{ $in: [userId, "$lovers"] }, true, false],
				},
			},
		},
	])
		.sort(sort)
		.limit(limit);

	return userPosts;
};

PostSchema.methods.populateLovers = async function populateLovers() {
	const post = this;

	await post
		.populate({
			path: "loversPreviews",
			select: "username displayname _id",
		})
		.execPopulate();
};

const Post = mongoose.model("Post", PostSchema);

export default Post;

// in the last five minutes
// createdAt: {
// 	$gte: new Date(new Date().getTime()-60*5*1000).toISOString()
// }
