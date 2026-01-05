import SiteReview from "../models/siteReviewModel.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Submit a site review
export const submitSiteReview = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User not found" });

    // 🚫 Block admins
    if (user.isAdmin) {
      return res.status(403).json({ message: "Admins cannot submit reviews." });
    }

    const { rating, comment, requestAdminTalk, messageToAdmin } = req.body;

    // Fixed validation: check specifically for undefined/null
    if (rating === undefined || rating === null || !comment?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create review
    const review = await SiteReview.create({
      user: user._id,
      rating,
      comment: comment.trim(),
    });



    // Populate user details
    const populatedReview = await review.populate("user", "name email");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};



// Public fetch reviews
export const getSiteReviews = async (req, res) => {
  try {
    const reviews = await SiteReview.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// Delete user's own site review
export const deleteSiteReview = async (req, res) => {
  try {
    const review = await SiteReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if the review belongs to the logged-in user
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};









