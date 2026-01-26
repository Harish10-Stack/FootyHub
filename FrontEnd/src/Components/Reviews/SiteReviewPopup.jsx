import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const API = "https://footyhub-backend-hrqm.onrender.com/api";

const ReviewPopup = ({ onClose, user, refreshReviews }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    if (user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Admins cannot submit reviews",
      });
      return;
    }

    const trimmedComment = comment.trim();
    if (rating < 1 || !trimmedComment) {
      Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please select a rating and enter a comment before submitting.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${API}/reviews`, {
        rating,
        comment: trimmedComment,
      }, {
        withCredentials: true, // if your backend uses cookies/auth
      });

      Swal.fire({
        icon: "success",
        title: "Review Submitted 🎉",
        text: "Thank you for your feedback!",
      });

      refreshReviews();
      onClose();
    } catch (error) {
      console.error("Review submission error:", error.response || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to submit review.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || rating < 1 || !comment.trim();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/30"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="relative bg-gray-50 rounded-2xl shadow-2xl p-8 w-full max-w-lg z-50 border border-gray-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          Rate Our Site ⭐
        </h2>

        {/* Star Rating */}
        <div className="mb-2 flex justify-center space-x-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-4xl cursor-pointer ${
                rating >= star
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
              onClick={() => setRating(star)}
              role="button"
              tabIndex={0}
              aria-label={`${star} star`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Rating Label */}
        <div className="text-center text-gray-700 mb-4">
          {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select a rating"}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Share your feedback..."
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none"
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onInput={(e) => (e.target.style.height = "auto")} // Auto-expand
          style={{ overflowY: "hidden" }}
          disabled={submitting}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
            disabled={submitting}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isSubmitDisabled}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;


