// src/Components/Products/ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import ProductHeader from "../Headers/ProductHeader.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import toast, { Toaster } from "react-hot-toast";
import socket from "../../utils/socket.js";
import api from "../../utils/api.js";
import Swal from "sweetalert2";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productReviews, setProductReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(null); // null initially, set after question

  const [purchaseQuestionAnswered, setPurchaseQuestionAnswered] =
    useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // -------------------------------
  // Fetch product, purchase status & reviews
  // -------------------------------
  const fetchProductAndPurchase = async () => {
    try {
      const resProduct = await api.get(`/products/${id}`);
      setProduct(resProduct.data);

      if (user) {
        const resPurchase = await api.get(`/orders/check/${id}`);
        setHasPurchased(resPurchase.data.purchased || false);
        console.log(
          "Purchase status for product",
          id,
          ":",
          resPurchase.data.purchased,
        );
      }

      const resReviews = await api.get(`/product-reviews/product/${id}`);
      setProductReviews(Array.isArray(resReviews.data) ? resReviews.data : []);
    } catch (err) {
      console.error("Error fetching product or purchase info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndPurchase();
  }, [id, user]);

  // -------------------------------
  // Refetch purchase status when component mounts (fallback for socket issues)
  // -------------------------------
  useEffect(() => {
    if (user && !hasPurchased) {
      // Small delay to allow for socket events to be processed first
      const timer = setTimeout(() => {
        fetchProductAndPurchase();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, id]);

  // -------------------------------
  // Socket.IO: real-time updates
  // -------------------------------
  useEffect(() => {
    const handleNewReview = ({ review }) => {
      if (review.product === id && review.user._id !== user?._id) {
        setProductReviews((prev) => [review, ...prev]);
      }
    };

    const handlePurchased = ({ userId, productIds }) => {
      console.log("Received product-purchased event:", {
        userId,
        productIds,
        currentUserId: user?._id,
        currentProductId: id,
      });
      if (user?._id === userId && productIds.includes(id)) {
        console.log("Setting hasPurchased to true");
        setHasPurchased(true);
      }
    };

    socket.on("new-review", handleNewReview);
    socket.on("product-purchased", handlePurchased);

    return () => {
      socket.off("new-review", handleNewReview);
      socket.off("product-purchased", handlePurchased);
    };
  }, [id, user]);

  // -------------------------------
  // Handle purchase question
  // -------------------------------
  const handlePurchaseYes = async () => {
    try {
      const resPurchase = await api.get(`/orders/check/${id}`);
      setHasPurchased(resPurchase.data.purchased || false);
      setPurchaseQuestionAnswered(true);
      if (!resPurchase.data.purchased) {
        Swal.fire({
          icon: "error",
          title: "Purchase Verification Failed",
          text: "Our records indicate you have not purchased this product. You cannot leave a review.",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      console.error("Error checking purchase:", err);
      Swal.fire({
        icon: "error",
        title: "Verification Error",
        text: "Failed to verify purchase. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handlePurchaseNo = () => {
    setHasPurchased(false);
    setPurchaseQuestionAnswered(true);
    Swal.fire({
      icon: "warning",
      title: "Purchase Required",
      text: "You must purchase the product to leave a review.",
      confirmButtonColor: "#f59e0b",
    });
  };

  // -------------------------------
  // Add to cart
  // -------------------------------
  const handleAddToCart = async () => {
    if (!user) return toast.error("Please login to add items to cart.");
    try {
      await addToCart({
        productId: product._id,
        quantity: qty,
        size: "",
        product,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  // -------------------------------
  // Submit review
  // -------------------------------
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to submit a review.");
    if (!newComment.trim()) return toast.error("Comment cannot be empty.");

    setSubmitting(true);
    try {
      const res = await api.post(`/product-reviews/product/${id}`, {
        productId: id,
        rating: newRating,
        comment: newComment,
      });

      setProductReviews((prev) => [res.data.review, ...prev]);
      setNewComment("");
      setNewRating(5);
      Swal.fire({
        icon: "success",
        title: "Review Submitted!",
        text: "Thank you for your feedback. Your review has been posted successfully.",
        confirmButtonColor: "#10b981",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          err.response?.data?.message ||
          "Failed to submit review. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------
  // Delete review
  // -------------------------------
  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this review!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/product-reviews/${reviewId}`);

        setProductReviews((prev) =>
          prev.filter((review) => review._id !== reviewId),
        );
        Swal.fire({
          icon: "success",
          title: "Review Deleted!",
          text: "Your review has been successfully deleted.",
          confirmButtonColor: "#10b981",
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text:
            err.response?.data?.message ||
            "Failed to delete review. Please try again.",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-gray-400">Loading product details...</p>
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-gray-400">Product not found.</p>
      </div>
    );

  // -------------------------------
  // Render description as bullet points
  // -------------------------------
  const renderDescription = () => {
    if (!product.description) return <p>No description available.</p>;

    if (Array.isArray(product.description)) {
      return (
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.description.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      );
    }

    if (typeof product.description === "string") {
      return (
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.description.split(",").map((point, idx) => (
            <li key={idx}>{point.trim()}</li>
          ))}
        </ul>
      );
    }

    return <p>No description available.</p>;
  };

  return (
    <>
      <ProductHeader />
      <Toaster />
      <div className="pt-28 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white rounded-3xl p-10 shadow-2xl border border-gray-200">
            
            {/* Image */}
            <div className="flex justify-center items-center">
              <div className="relative bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-200">
                <img
                  src={`https://footyhub-backend-hrqm.onrender.com${product.img}`} // ✅ backend image URL
                  alt={product.name}
                  className="w-full max-w-md h-auto object-contain rounded-2xl"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-100/30 to-transparent rounded-3xl"></div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-5xl font-extrabold text-gray-900">
                  {product.name}
                </h1>
                <div className="text-4xl text-green-600 font-bold mb-4 font-mono">
                  ₹{Number(product.price)?.toLocaleString("en-IN")}
                </div>
                {renderDescription()}
              </div>

              {!user?.isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 shadow-md">
                    <span className="text-gray-900 font-semibold text-lg">
                      Quantity:
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                        className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 text-gray-900 font-bold text-xl flex items-center justify-center hover:scale-110 shadow-md border border-gray-200"
                      >
                        −
                      </button>
                      <span className="text-gray-900 font-bold text-xl min-w-[3rem] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 text-gray-900 font-bold text-xl flex items-center justify-center hover:scale-110 shadow-md border border-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-green-500"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>
            {user && !user.isAdmin && !purchaseQuestionAnswered && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  Have you purchased this product?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handlePurchaseYes}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handlePurchaseNo}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
            {user &&
              !user.isAdmin &&
              hasPurchased &&
              purchaseQuestionAnswered && (
                <form onSubmit={handleSubmitReview} className="mb-8 space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="font-semibold text-gray-700">
                      Your Rating:
                    </label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="p-2 border rounded-lg"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} ⭐
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            {user && !hasPurchased && purchaseQuestionAnswered && (
              <p className="text-gray-500 mb-4">
                You need to purchase this product to leave a review.
              </p>
            )}
            {!user && (
              <p className="text-gray-500 mb-4">Login to leave a review.</p>
            )}

            {productReviews.length > 0 ? (
              productReviews.map((r) => (
                <div
                  key={r._id}
                  className="mb-4 p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {r.user?.name || "Anonymous"}
                      </p>
                      <p className="text-yellow-500 font-semibold">
                        Rating: {r.rating} ⭐
                      </p>
                      <p className="mt-2">{r.comment}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {user && r.user?._id === user._id && (
                      <button
                        onClick={() => handleDeleteReview(r._id)}
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                {user && hasPurchased
                  ? "No reviews yet. Be the first to review!"
                  : "No reviews yet."}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
