import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getFixtures,
  createFixture,
  updateFixture,
  deleteFixture,
  addReaction,
  addComment,
  getComments,
  getReactions,
  deleteComment,
} from "../controllers/fixtureController.js";

const router = express.Router();

router.get("/", getFixtures); // public
router.post("/", protect, admin, createFixture);
router.put("/:id", protect, admin, updateFixture);
router.delete("/:id", protect, admin, deleteFixture);

// Reactions & Comments
router.post("/:id/react", protect, addReaction);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getComments);
router.get("/:id/reactions", getReactions);
router.delete("/:id/comment/:commentId", protect, deleteComment);

export default router;






