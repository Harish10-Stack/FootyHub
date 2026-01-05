import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import SiteReview from "../models/siteReviewModel.js";
import { submitSiteReview, getSiteReviews, deleteSiteReview } from "../controllers/siteReviewController.js";

const router = express.Router();

// User submits a review (must be logged in, not admin)
router.post("/", protect, submitSiteReview);

// Public route to fetch reviews
router.get("/", getSiteReviews);

// Admin-only route to fetch all reviews
router.get("/site/all", protect, admin, getSiteReviews);



// User deletes their own review
router.delete("/:id", protect, deleteSiteReview);

// Admin deletes review
router.delete("/site/:id", protect, admin, async (req, res) => {
  try {
    const review = await SiteReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;







