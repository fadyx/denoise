import mongoose from "mongoose";
import _ from "lodash";

const { Schema } = mongoose;

const commentSchema = new Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: [true, "post id is required."],
			index: true,
		},

		username: {
			type: String,
			ref: "User",
			required: [true, "username is required."],
		},

		displayname: {
			type: String,
			trim: true,
			required: [true, "display name is required."],
		},

		text: {
			type: String,
			trim: true,
			required: [true, "text is required."],
		},

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

		upvotes: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		downvotes: [
			{
				type: String,
				required: [true, "username is required."],
				ref: "User",
				foreignField: "username",
			},
		],

		stats: {
			replies: { type: Number, default: 0 },
			upvotes: { type: Number, default: 0 },
			downvotes: { type: Number, default: 0 },
		},

		hasReplies: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

commentSchema.methods.toJSON = function toJSON() {
	const user = this;
	const publicComment = _.pick(user.toObject(), [
		"_id",
		"postId",
		"username",
		"displayname",
		"text",
		"stats",
		"hasReplies",
		"createdAt",
	]);

	return publicComment;
};

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
