import express from "express";
import { getNews, createNews, updateNews, deleteNews, addReaction, addComment, getComments, getReactions, deleteComment } from "../controllers/newsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getNews); // public
router.post("/", protect, admin, createNews);
router.put("/:id", protect, admin, updateNews);
router.delete("/:id", protect, admin, deleteNews);

// Reactions and comments
router.post("/:id/react", protect, addReaction);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getComments);
router.get("/:id/reactions", getReactions);
router.delete("/:id/comment/:commentId", protect, deleteComment);

export default router;
