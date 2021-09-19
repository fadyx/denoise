import httpError from "http-errors";
import mongoose from "mongoose";

import Post from "../models/post.js";
import Comment from "../models/comment.js";

import catchAsync from "../middleware/catchAsyncErrors.js";
import RunUnitOfWork from "../database/RunUnitOfWork.js";
import text from "../utils/text.js";

const createPost = catchAsync(async (req, res) => {
	const { user } = req;
	const postDto = req.body;
	const post = new Post({
		userId: user.id,
		username: user.username,
		displayname: user.displayname,
		text: postDto.text,
		allowComments: postDto.allowComments,
		flags: postDto.flags,
	});
	await post.save();
	return res.status(201).json(post);
});

const getPost = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) return next(httpError(404, "Post was not found."));
	const post = await Post.findById(postId);
	if (!post || user.isBlockingOrBlockedBy(post.userId)) return next(httpError(404, "Post was not found."));
	const isLoved = post.lovers.includes(user._id);
	return res.status(200).json({ ...post.toJSON(), isLoved });
});

const createComment = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;
	const commentDto = req.body;
	if (!text.isValidObjectId(postId)) throw httpError(404, "Post was not found.");
	const uow = async (session) => {
		const post = await Post.findById(postId).session(session);
		if (!post || user.isBlockingOrBlockedBy(post.userId)) throw httpError(404, "Post was not found.");
		if (!post.allowComments) throw httpError(403, "comments are not allowed on this post.");
		const comment = new Comment({
			userId: user._id,
			postId: post._id,
			username: user.username,
			displayname: user.displayname,
			text: commentDto.text,
		});
		await comment.save({ session });
		post.commentsCounter += 1;
		await post.save({ session });
		return comment;
	};
	const comment = await RunUnitOfWork(uow);
	return res.status(201).json(comment);
});

const deletePost = catchAsync(async (req, res) => {
	const { user } = req;
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) throw httpError(404, "post was not found.");
	const post = await Post.findById(postId);
	if (!post || post.deleted || !(await user.isBlockingOrBlockedBy(post.userId)))
		throw httpError(404, "post was not found.");
	if (!user._id.equals(post.userId)) throw httpError(403, "Unauthorized.");
	post.deleted = true;
	await post.save();
	return res.status(200).json();
});

const deleteComment = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { postId } = req.params;
	const { commentId } = req.params;
	if (!text.isValidObjectId(postId) || !text.isValidObjectId(commentId))
		throw httpError(404, "comment was not found.");
	const post = await Post.findById(postId);
	if (!post || post.deleted || !(await user.isBlockingOrBlockedBy(post.userId)))
		throw httpError(404, "post was not found.");
	const comment = await Comment.findById(commentId);
	if (!comment || comment.deleted || !comment.postId.equals(post._id)) throw httpError(404, "comment was not found.");
	if (!user._id.equals(comment.userId)) return next(httpError(403, "unauthorized."));
	comment.deleted = true;
	const uow = async (session) => {
		await comment.save({ session });
		post.commentsCounter -= 1;
		await post.save({ session });
	};
	await RunUnitOfWork(uow);
	return res.status(200).json();
});

const lovePost = catchAsync(async (req, res, next) => {
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) return next(httpError(404, "post was not found."));
	const post = await Post.findById(postId);

	if (!post || post.deleted || !req.user.isBlockingOrBlockedBy(post.userId))
		throw httpError(404, "post was not found.");

	if (post.lovers.includes(req.user._id)) return next(httpError(403, "post is already loved."));
	post.lovers.addToSet(req.user._id);
	await post.save();
	return res.status(200).json();
});

const unlovePost = catchAsync(async (req, res, next) => {
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) return next(httpError(404, "post was not found."));
	const post = await Post.findById(postId);
	if (!post || post.deleted || !req.user.isBlockingOrBlockedBy(post.userId))
		throw httpError(404, "post was not found.");
	if (!post.lovers.includes(req.user._id)) return next(httpError(403, "post is already loved."));
	post.lovers.addToSet(req.user._id);
	await post.save();
	return res.status(200).json();
});

const getPostLovers = catchAsync(async (req, res, next) => {
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) return next(httpError(404, "post was not found."));
	const post = await Post.findById(postId);
	if (!post || post.deleted || !req.user.isBlockingOrBlockedBy(post.userId))
		return next(httpError(404, "post was not found."));
	// if (!post.userId.equals(req.user._id))
	//    return next(createError(403, "forbidden request, only the author of the post can review who loved it."));
	await post.populateLovers();
	return res.status(200).json(post.loversPreviews);
});

const getPostComments = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { lastCommentId } = req.query;
	const { postId } = req.params;
	if (!text.isValidObjectId(postId)) return next(httpError(404, "post was not found."));
	if (lastCommentId && !text.isValidObjectId(lastCommentId)) return next(httpError(404, "invalid pagination key."));
	const post = await Post.findById(postId);
	if (!post || post.deleted || !(await req.user.isBlockingOrBlockedBy(post.userId)))
		return next(httpError(404, "post was not found."));

	const comments = await Comment.find({
		postId,
		_id: { $lt: mongoose.Types.ObjectId(lastCommentId) },
		deleted: false,
		userId: { $nin: [...user.blocking, ...user.blocked] },
	})
		.sort({ _id: -1 })
		.limit(20)
		.select("-__v -postId -updatedAt -deleted")
		.exec();
	return res.status(200).json(comments);
});

const newsfeed = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { lastPostId } = req.query;
	const { type } = req.params;
	if (lastPostId && !text.isValidObjectId(lastPostId)) return next(httpError(400, "invalid pagination key."));
	const match = {};
	if (lastPostId) match._id = { $lt: mongoose.Types.ObjectId(lastPostId) };
	const limit = 20;
	let sort;

	switch (type) {
		case "latest":
			sort = { _id: -1 };
			match.userId = { $nin: [...user.blocking, ...user.blocked] };
			break;
		case "followees":
			sort = { _id: -1 };
			match.userId = { $in: user.followees };
			break;
		case "hot":
			match.userId = { $nin: [...user.blocking, ...user.blocked] };
			sort = { loversCounter: -1 };
			break;
		default:
			return next(httpError(400, "invalid newsfeed type."));
	}

	// const postsX = await Post.find({
	// 	$match: {
	// 		...match,
	// 		deleted: false,
	// 		createdAt: {
	// 			$gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
	// 		},
	// 	},
	// });

	const posts = await Post.aggregate([
		{
			$match: {
				...match,
				deleted: false,
				createdAt: {
					$gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
				},
			},
		},
		{
			$set: {
				isLoved: {
					$in: [user._id, "$lovers"],
				},
			},
		},
		// {
		// 	$addFields: {
		// 		isLoved: {
		// 			$cond: [{ $in: [user._id, "$lovers"] }, true, false],
		// 		},
		// 	},
		// },
	])
		.sort(sort)
		.limit(limit);

	let lastPage = false;
	if (posts.length < limit) lastPage = true;
	res.set("Last-Page", lastPage);
	return res.status(200).json(posts);
});

const reportPost = catchAsync(async (req, res, _next) => res.status(200).json());

const reportComment = catchAsync(async (req, res, _next) => res.status(200).json());

export default {
	createPost,
	getPost,
	newsfeed,
	lovePost,
	reportPost,
	unlovePost,
	createComment,
	deletePost,
	deleteComment,
	reportComment,
	getPostLovers,
	getPostComments,
};

/*

// delete a post atomically
await Post.updateOne(
  {
    _id: postId,
    comments: {
      $elemMatch: {
        _id: commentId,
        owner: req.user._id,
        deleted: false,
      },
    },
  },
  {
    $set: {
      "comments.$.deleted": true,
    },
  }
)
  .then((result) => {
    if (result.n) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  })
  .catch((error) => {
    res.status(500).json();
  });
*/
