const mongoose = require('mongoose');

const Post = mongoose.model('Post');
const User = mongoose.model('User');
const Comment = mongoose.model('Comment');

module.exports = {
  async create(req, res, next) {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(400).json({ error: "Post doesn't exist" });
      }

      const user = await User.findById(post.user);

      const userIndex = user.friends.indexOf(req.userId);

      if (userIndex === -1 && user.id !== req.userId) {
        return res.status(400).json({ error: "You don't have permission to comment on this post" });
      }

      const comment = await Comment.create({ ...req.body, post: post.id, user: req.userId });

      post.comments.push(comment.id);
      await post.save();

      return res.json(comment);
    } catch (err) {
      return next(err);
    }
  },

  async destroy(req, res, next) {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(400).json({ error: "Post doesn't exist" });
      }

      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(400).json({ error: "Comment doesn't exist" });
      }

      if (comment.user != req.userId && post.user != req.userId) {
        return res.status(400).json({ error: "You don't have permission to delete this comment" });
      }

      await Comment.findByIdAndRemove(comment.id);

      const commentIndex = post.comments.indexOf(comment.id);

      post.comments.splice(commentIndex, 1);
      await post.save();

      return res.send();
    } catch (err) {
      return next(err);
    }
  },
};
