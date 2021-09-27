import mongoose from "mongoose";

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

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
