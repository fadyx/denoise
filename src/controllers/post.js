import httpError from "http-errors";
import mongoose from "mongoose";

import Post from "../models/post.js";
import Comment from "../models/comment.js";

const createPost = async (req, res, next) => {
	try {
		const validatedPost = req.validRequest;
		const post = new Post({
			userId: req.user._id,
			username: req.user.username,
			displayName: req.user.displayname,
			content: validatedPost.content,
			allowComments: validatedPost.allowComments,
			falgs: validatedPost.falgs,
		});

		await post.save();
		return res.status(201).json(post);
	} catch (error) {
		return next(error);
	}
};

const getPost = async (req, res, next) => {
	const { user } = req;
	const { postId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);
		if (!post || !(await user.isCommunicableWithId(post.userId))) return next(httpError(404, "post was not found."));

		const isLoved = post.lovers.includes(user._id);

		return res.status(200).json({ ...post.toJSON(), isLoved });
	} catch (error) {
		return next(error);
	}
};

const createComment = async (req, res, next) => {
	const commenter = req.user;
	const { postId } = req.params;
	const validatedPost = req.validRequest;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);
		if (!post) return next(httpError(404, "post was not found."));
		if (!(await commenter.isCommunicableWithId(post.userId))) return next(httpError(404, "post was not found."));
		if (!post.allowComments) return next(httpError(403, "comments are not allowed on this post."));

		const comment = new Comment({
			userId: commenter._id,
			postId: post._id,
			deviceUuid: commenter.uuid,
			username: commenter.username,
			displayName: commenter.displayname,
			content: validatedPost.content,
		});

		await comment.save();
		await post.incrementCommentsCounter();
		await post.save();
		return res.status(201).json(comment);
	} catch (error) {
		return next(error);
	}
};

const deletePost = async (req, res, next) => {
	const { user } = req;
	const { postId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);

		if (!post || post.deleted || !(await user.isCommunicableWithId(post.userId)))
			return next(httpError(404, "post was not found."));

		if (!user._id.equals(post.userId)) return next(httpError(403));

		await post.deletePost();
		await post.save();
		return res.status(200).json();
	} catch (error) {
		return next(error);
	}
};

const deleteComment = async (req, res, next) => {
	const { postId } = req.params;
	const { commentId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));
	if (!isObjectId(commentId)) return next(httpError(404, "comment was not found."));

	try {
		const post = await Post.findById(postId);
		if (!post || post.deleted || !(await req.user.isCommunicableWithId(post.userId))) {
			return next(httpError(404, "post was not found."));
		}

		const comment = await Comment.findById(commentId);
		if (!comment || comment.deleted || !comment.postId.equals(post._id)) {
			return next(httpError(404, "comment was not found."));
		}

		if (!req.user._id.equals(comment.userId)) return next(httpError(403));

		await comment.deleteComment();
		await comment.save();
		await post.decrementCommentsCounter();
		await post.save();

		return res.status(200).json();
	} catch (error) {
		return next(error);
	}
};

const lovePost = async (req, res, next) => {
	const { postId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);

		if (!post || post.deleted || !(await req.user.isCommunicableWithId(post.userId))) {
			return next(httpError(404, "post was not found."));
		}

		if (post.lovers.includes(req.user._id)) return next(httpError(403, "post is already loved."));

		await post.lovePost(req.user._id);
		await post.save();
		return res.status(200).json();
	} catch (error) {
		return next(error);
	}
};

const unlovePost = async (req, res, next) => {
	const { postId } = req.params;

	if (!isObjectId(postId)) {
		return next(httpError(404, "post was not found."));
	}

	try {
		const post = await Post.findById(postId);

		if (!post || post.deleted || !(await req.user.isCommunicableWithId(post.userId))) {
			return next(httpError(404, "post was not found."));
		}

		if (!post.lovers.includes(req.user._id)) return next(httpError(403, "post is already unloved."));

		await post.unlovePost(req.user._id);
		await post.save();
		return res.status(200).json();
	} catch (error) {
		return next(error);
	}
};

const getPostLovers = async (req, res, next) => {
	const { postId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);

		if (!post || post.deleted || !(await req.user.isCommunicableWithId(post.userId))) {
			return next(httpError(404, "post was not found."));
		}

		// if (!post.userId.equals(req.user._id))
		//    return next(createError(403, "forbidden request, only the author of the post can review who loved it."));
		await post.populateLovers();
		return res.status(200).json(post.loversPreviews);
	} catch (error) {
		return next(error);
	}
};

const getPostComments = async (req, res, next) => {
	const { user } = req;
	const { postId } = req.params;

	if (!isObjectId(postId)) return next(httpError(404, "post was not found."));

	try {
		const post = await Post.findById(postId);

		if (!post || post.deleted || !(await req.user.isCommunicableWithId(post.userId))) {
			return next(httpError(404, "post was not found."));
		}

		// if (post.userId.equals(req.user._id)) {
		//    return res.status(200).json(post.comments);
		// }
		// else, filter comments by blocked/blocking users and return comments
		// const comments = await Post.findById(post._id).select("comments -_id").exec();

		const comments = await Comment.find({
			postId,
			deleted: false,
			userId: { $nin: [...user.blocking, ...user.blocked, ...user.blockedWithUUIDS] },
		})
			.sort({ _id: -1 })
			.limit(20)
			.select("-__v -postId -deviceUuid -updatedAt -deleted")
			.exec();

		return res.status(200).json(comments);
	} catch (error) {
		return next(error);
	}
};

const newsfeed = async (req, res, next) => {
	const { user } = req;
	const { lastPostId } = req.query;
	const { type } = req.params;

	if (lastPostId && !isObjectId(lastPostId)) return next(httpError(400, "invalid pagination key."));

	try {
		const match = { deleted: false };
		if (lastPostId) match._id = { $lt: mongoose.Types.ObjectId(lastPostId) };
		const limit = 20;
		let sort;

		switch (type) {
			case "latest":
				sort = { _id: -1 };
				match.userId = { $nin: [...user.blocking, ...user.blocked, ...user.blockedWithUUIDS] };
				break;
			case "followees":
				sort = { _id: -1 };
				match.userId = { $in: user.followees };
				break;
			case "hot":
				match.userId = { $nin: [...user.blocking, ...user.blocked, ...user.blockedWithUUIDS] };
				sort = { loversCounter: -1 };
				break;
			default:
				return next(httpError(400, "invalid newsfeed type."));
		}

		// const posts = await Post.find(match).sort(sort).limit(limit);
		const posts = await Post.aggregate([
			{
				$match: { ...match },
			},
			{
				$addFields: {
					isLoved: {
						$cond: [{ $in: [user._id, "$lovers"] }, true, false],
					},
				},
			},
		])
			.sort(sort)
			.limit(limit);

		let lastPage = false;
		if (posts.length === 0 || posts.length < limit) lastPage = true;
		res.set("Last-Page", lastPage);

		return res.status(200).json(posts);
	} catch (error) {
		return next(error);
	}
};

const reportPost = async (req, res, _next) => res.status(200).json();

const reportComment = async (req, res, _next) => res.status(200).json();

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
