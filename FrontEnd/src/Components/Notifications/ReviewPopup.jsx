
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function ReviewPopup({ orderId, notifId, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire("Oops!", "Please select a star rating", "warning");
      return;
    }

    try {
      // Submit the review
      if (onSubmit) {
        await onSubmit({ orderId, rating, comment });
      } else {
        await axios.post(
          "https://footyhub-backend-cqir.onrender.com/api/reviews",
          { orderId, rating, comment },
          { withCredentials: true }
        );
      }

      // Mark the notification as read if notifId is provided
      if (notifId) {
        await axios.put(
          `https://footyhub-backend-cqir.onrender.com/api/notifications/read/${notifId}`,
          {},
          { withCredentials: true }
        );
      }

      // Close the popup
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not submit review", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-[90%] sm:w-96">
        <h2 className="text-base sm:text-lg font-semibold mb-2">Review your order</h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-4">
          Thank you for your purchase! Please leave a review:
        </p>

        <div className="flex space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-xl sm:text-2xl px-1 ${star <= rating ? "text-yellow-400" : "text-gray-500"}`}
            >
              ★
            </button>   
          ))}
        </div>

        <textarea
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 text-white text-sm sm:text-base mb-4"
        />


        <div className="flex flex-col sm:flex-row justify-end gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
