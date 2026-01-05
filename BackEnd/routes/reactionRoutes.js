import express from "express";
import ReactionComment from "../models/ReactionComment.js";
import { protect } from "../middleware/authMiddleware.js"; // middleware to check user logged in

const router = express.Router();

// Get all reactions and comments for a fixture
router.get("/:fixtureId", async (req, res) => {
  try {
    const data = await ReactionComment.find({ fixtureId: req.params.fixtureId });
    
    // Aggregate reactions
    const reactions = { like: 0, love: 0, fire: 0 };
    data.forEach(item => {
      reactions.like += item.reactions.like;
      reactions.love += item.reactions.love;
      reactions.fire += item.reactions.fire;
    });

    res.json({ reactions, comments: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a reaction to a fixture
router.post("/react", protect, async (req, res) => {
  const { fixtureId, type } = req.body;
  if (!["like", "love", "fire"].includes(type)) return res.status(400).json({ message: "Invalid reaction type" });

  try {
    let rc = await ReactionComment.findOne({ fixtureId, userId: req.user._id });
    if (!rc) {
      rc = await ReactionComment.create({
        fixtureId,
        userId: req.user._id,
        username: req.user.name,
        reactions: { like: 0, love: 0, fire: 0 },
      });
    }

    rc.reactions[type] += 1;
    await rc.save();

    res.json(rc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a fixture
router.post("/comment", protect, async (req, res) => {
  const { fixtureId, text } = req.body;
  try {
    const rc = await ReactionComment.create({
      fixtureId,
      userId: req.user._id,
      username: req.user.name,
      text,
      reactions: { like: 0, love: 0, fire: 0 },
    });
    res.json(rc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user's own comment on a fixture
router.delete("/comment/:id", protect, async (req, res) => {
  try {
    const comment = await ReactionComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the comment belongs to the logged-in user
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
