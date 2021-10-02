import mongoose from "mongoose";

import Post from "../models/post.js";

const removePostsByUsername = async ({ username, deletedBy }, { session }) => {
	await Post.updateMany(
		{
			username,
			deleted: false,
			createdAt: { $gte: new Date(new Date().getTime() - process.env.LIFESPAN_MILLISECONDS) },
		},
		{ deleted: true, deletedBy },
		{ session },
	);
};

const getPostsByUsername = async ({ username, lastId }) => {
	const limit = 20;
	const sort = { _id: -1 };
	const match = { deleted: false, username };
	if (lastId) match._id = { $lt: mongoose.Types.ObjectId(lastId) };

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

	const nextPaginationKey = userPosts[userPosts.length - 1]._id;

	const results = { count: userPosts.length, nextPaginationKey, posts: userPosts, hasNextPage };
	return results;
};

export default { removePostsByUsername, getPostsByUsername };
