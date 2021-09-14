import mongoose from "mongoose";
import _ from "lodash";

import postProperties from "./properties/post.js";
import getHashtags from "../utils/text/index.js";

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

		displayName: {
			type: String,
			required: [true, "display name is required."],
		},

		content: {
			type: String,
			maxlength: [
				postProperties.content.maxLength,
				`content cannot exceed ${postProperties.content.maxLength} characters.`,
			],
			minlength: [postProperties.content.minLength, "content cannot be empty."],
			required: [true, "content is required."],
		},

		lovers: [
			{
				type: mongoose.Types.ObjectId,
				required: [true, "user id is required."],
				ref: "User",
			},
		],
		// lovers: {
		//    type: [
		//       {
		//          type: mongoose.Types.ObjectId,
		//          required: [true, "user id is required."],
		//          ref: "User",
		//       },
		//    ],
		//    select: false,
		// },

		loversCounter: {
			type: Number,
			default: 0,
			index: true,
		},

		toxicityLevel: {
			type: Number,
			default: 0.1,
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
					values: postProperties.flags.options,
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
			// select: false,
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
		"toxicityLevel",
		"userId",
		"lovers",
		"updatedAt",
		"__v",
		"username",
		"displayName",
		"flags",
		"allowComments",
		"hashtags",
		"loversCounter",
		"commentsCounter",
		"content",
		"createdAt",
	]);

	return publicPost;
};

PostSchema.set("toObject", { virtuals: true, getters: true });
PostSchema.set("toJSON", { virtuals: true, getters: true });

PostSchema.pre("save", async function pre(next) {
	const post = this;

	if (post.isNew) {
		const extractedHashtags = getHashtags(post.content);
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

PostSchema.methods.lovePost = async function lovePost(loverId) {
	const post = this;
	post.lovers.addToSet(loverId);
};

PostSchema.methods.unlovePost = async function unlovePost(loverId) {
	const post = this;
	post.lovers.remove(loverId);
};

PostSchema.methods.deletePost = async function deletePost() {
	const post = this;
	post.deleted = true;
};

PostSchema.methods.undeletePost = async function undeletePost() {
	const post = this;
	post.deleted = false;
};

PostSchema.methods.incrementCommentsCounter = async function incrementCommentsCounter() {
	const post = this;
	post.commentsCounter += 1;
};

PostSchema.methods.decrementCommentsCounter = async function decrementCommentsCounter() {
	const post = this;
	post.commentsCounter -= 1;
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
