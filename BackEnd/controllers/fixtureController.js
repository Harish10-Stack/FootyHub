import asyncHandler from "express-async-handler";
import Fixture from "../models/Fixture.js";

// GET all fixtures
export const getFixtures = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find().sort({ date: 1 });
  res.json(fixtures);
});

// CREATE fixture (admin only)
export const createFixture = asyncHandler(async (req, res) => {
  const { home, away, date, time, league } = req.body;

  if (!home || !away || !date || !time || !league) {
    res.status(400);
    throw new Error("Please provide all fields");
  }

  const fixture = new Fixture({ home, away, date, time, league });
  const created = await fixture.save();
  res.status(201).json(created);
});

// DELETE fixture (admin only)
export const deleteFixture = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  if (!fixture) {
    res.status(404);
    throw new Error("Fixture not found");
  }

  await fixture.deleteOne();
  res.json({ message: "Fixture removed successfully" });
});

// Add or toggle reaction (users only)
export const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const fixture = await Fixture.findById(req.params.id);
  if (!fixture) throw new Error("Fixture not found");

  if (req.user.isAdmin) return res.status(403).json({ message: "Admins cannot react" });

  const existing = fixture.reactions.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existing) {
    if (existing.emoji === emoji) {
      // Remove reaction if same emoji clicked
      fixture.reactions = fixture.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
    } else {
      // Update to new emoji
      existing.emoji = emoji;
    }
  } else {
    // Add new reaction
    fixture.reactions.push({ user: req.user._id, emoji });
  }

  await fixture.save();
  res.json(fixture);
});

// Add comment (users only)
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const fixture = await Fixture.findById(req.params.id);
  if (!fixture) throw new Error("Fixture not found");

  if (req.user.isAdmin) return res.status(403).json({ message: "Admins cannot comment" });

  fixture.comments.push({ user: req.user._id, text });
  await fixture.save();

  const populated = await fixture.populate("comments.user", "name");
  res.json(populated.comments);
});

// Get comments for a fixture
export const getComments = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id).populate("comments.user", "name");
  if (!fixture) throw new Error("Fixture not found");
  res.json(fixture.comments);
});

// Get reactions for a fixture
export const getReactions = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id).populate("reactions.user", "name");
  if (!fixture) throw new Error("Fixture not found");
  res.json(fixture.reactions);
});

// Delete user's own comment on a fixture
export const deleteComment = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  if (!fixture) throw new Error("Fixture not found");

  const commentIndex = fixture.comments.findIndex(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (commentIndex === -1) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const comment = fixture.comments[commentIndex];

  // Check if the comment belongs to the logged-in user
  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own comments");
  }

  fixture.comments.splice(commentIndex, 1);
  await fixture.save();

  res.json({ message: "Comment deleted successfully" });
});

// UPDATE fixture (admin only)
export const updateFixture = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  if (!fixture) {
    res.status(404);
    throw new Error("Fixture not found");
  }

  const { home, away, date, time, league } = req.body;
  fixture.home = home || fixture.home;
  fixture.away = away || fixture.away;
  fixture.date = date || fixture.date;
  fixture.time = time || fixture.time;
  fixture.league = league || fixture.league;

  const updated = await fixture.save();
  res.json(updated);
});








