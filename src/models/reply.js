import mongoose from "mongoose";

const { Schema } = mongoose;

const replySchema = new Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: [true, "post id is required."],
			index: true,
		},

		commentId: {
			type: Schema.Types.ObjectId,
			ref: "Comment",
			required: [true, "comment id is required."],
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
			upvotes: { type: Number, default: 0 },
			downvotes: { type: Number, default: 0 },
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
	},
	{ timestamps: true },
);

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
