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
		},
		reported: {
			type: Boolean,
			default: false,
		},

		reporters: [
			{
				type: String,
				required: true,
			},
		],
	},
	{ timestamps: true },
);

commentSchema.methods.deleteComment = async function deleteComment() {
	const comment = this;
	comment.deleted = true;
};

commentSchema.methods.undeleteComment = async function undeleteComment() {
	const comment = this;
	comment.deleted = false;
};

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
