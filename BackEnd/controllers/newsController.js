import asyncHandler from "express-async-handler";
import News from "../models/News.js";

// GET all news
export const getNews = asyncHandler(async (req, res) => {
  const news = await News.find().sort({ date: -1 });
  res.json(news);
});

// CREATE news (admin only)
export const createNews = asyncHandler(async (req, res) => {
  const { title, description, date } = req.body;

  if (!title || !description || !date) {
    res.status(400);
    throw new Error("Please provide all fields");
  }

  const news = new News({ title, description, date });
  const created = await news.save();
  res.status(201).json(created);
});

// UPDATE news (admin only)
export const updateNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) {
    res.status(404);
    throw new Error("News not found");
  }

  const { title, description, date } = req.body;
  news.title = title || news.title;
  news.description = description || news.description;
  news.date = date || news.date;

  const updated = await news.save();
  res.json(updated);
});

// DELETE news (admin only)
export const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) {
    res.status(404);
    throw new Error("News not found");
  }

  await news.deleteOne();
  res.json({ message: "News removed successfully" });
});

// Add reaction (users only)
export const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const news = await News.findById(req.params.id);
  if (!news) throw new Error("News not found");

  if (req.user.isAdmin) return res.status(403).json({ message: "Admins cannot react" });

  const existing = news.reactions.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existing) existing.emoji = emoji;
  else news.reactions.push({ user: req.user._id, emoji });

  await news.save();
  res.json(news);
});

// Add comment (users only)
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const news = await News.findById(req.params.id);
  if (!news) throw new Error("News not found");

  if (req.user.isAdmin) return res.status(403).json({ message: "Admins cannot comment" });

  news.comments.push({ user: req.user._id, text });
  await news.save();

  const populated = await news.populate("comments.user", "name");
  res.json(populated.comments);
});

// Get comments for a news item
export const getComments = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id).populate("comments.user", "name");
  if (!news) throw new Error("News not found");
  res.json(news.comments);
});

// Get reactions for a news item
export const getReactions = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id).populate("reactions.user", "name");
  if (!news) throw new Error("News not found");
  res.json(news.reactions);
});

// Delete user's own comment on a news item
export const deleteComment = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) throw new Error("News not found");

  const commentIndex = news.comments.findIndex(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (commentIndex === -1) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const comment = news.comments[commentIndex];

  // Check if the comment belongs to the logged-in user
  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own comments");
  }

  news.comments.splice(commentIndex, 1);
  await news.save();

  res.json({ message: "Comment deleted successfully" });
});
