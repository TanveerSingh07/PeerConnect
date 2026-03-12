import Post from "../models/Post.js";
import { createNotification } from "./notificationController.js";

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const { limit = 10, skip = 0, type, tag } = req.query;

    let query = {};
    if (type) query.type = type;
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .populate("author", "name profilePic department year")
      .populate({
        path: "comments.user",
        select: "name profilePic",
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Post.countDocuments(query);

    res.json({ posts, total });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePic department year")
      .populate("comments.user", "name profilePic");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, tags, type, image, opportunityDetails } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content,
      tags: tags || [],
      type: type || "post",
      image,
      opportunityDetails,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name profilePic department year",
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.content = req.body.content || post.content;
    post.tags = req.body.tags || post.tags;
    post.image = req.body.image || post.image;

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like/unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    let wasLiked = false;

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      wasLiked = false;
    } else {
      // Like
      post.likes.push(req.user._id);
      wasLiked = true;
    }

    await post.save();

    // ✅ Create notification ONLY when liked (not unliked) and not own post
    if (wasLiked && post.author.toString() !== req.user._id.toString()) {
      await createNotification(post.author, "like", req.user._id, {
        relatedId: post._id,
        message: "liked your post",
        link: "/dashboard",
        postContent: post.content.slice(0, 50) + "...",
      });
    }

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name profilePic department year")
      .populate("comments.user", "name profilePic");

    res.json({ message: "Post like toggled", post: populatedPost });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    // ✅ Create notification if not own post
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification(post.author, "comment", req.user._id, {
        relatedId: post._id,
        message: "commented on your post",
        link: "/dashboard",
        postContent: post.content.slice(0, 50) + "...",
      });
    }

    // Populate and return
    const populatedPost = await Post.findById(post._id)
      .populate("author", "name profilePic department year")
      .populate({
        path: "comments.user",
        select: "name profilePic",
      });

    res.json(populatedPost);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name profilePic department year")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};