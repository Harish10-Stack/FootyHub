import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../Explore/AuthContext.jsx";
import Header from "../Home/Header.jsx";
import Footer from "../Home/Footer.jsx";
import "./MainPage.css";
import ReviewPopup from "../Reviews/SiteReviewPopup.jsx";

const upcomingFixtures = [
  {
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    date: "2025-11-01",
    time: "19:00",
  },
  {
    homeTeam: "Chelsea",
    awayTeam: "Arsenal",
    date: "2025-11-02",
    time: "21:00",
  },
  {
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    date: "2025-11-03",
    time: "20:00",
  },
  {
    homeTeam: "Juventus",
    awayTeam: "Inter Milan",
    date: "2025-11-05",
    time: "18:30",
  },
];

const mainProducts = [
  { id: 1, name: "Football", price: "₹2,969", img: "/uploads/Footballs/id1.webp" },
  { id: 2, name: "Jersey", price: "₹1,299", img: "/uploads/Jerseys/id19.webp" },
  { id: 3, name: "Football Boots", price: "₹15,999", img: "/uploads/Boots/id40.webp" },
];

const MainPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [votes, setVotes] = useState({ messi: 0, ronaldo: 0 });
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Review popup state
  const [showReview, setShowReview] = useState(false);

  // 🔹 Reviews list state
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(5); // Show 5 reviews initially

  // Fetch poll data on mount
  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await axios.get("https://footyhub-backend-cqir.onrender.com/api/poll");
        setVotes({
          messi: response.data.totalMessi,
          ronaldo: response.data.totalRonaldo,
        });
        if (user && user.votedPlayer) setVoted(true);
      } catch (error) {
        console.error("Error fetching poll data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPollData();
  }, [user]);

  // 🔹 Show review popup 15s after login
  useEffect(() => {
    if (!user) return;
    const dismissed = sessionStorage.getItem("siteReviewDismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShowReview(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [user]);

  // 🔹 Fetch all reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get("https://footyhub-backend-cqir.onrender.com/api/reviews");
      const sorted = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReviews(sorted);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCloseReview = () => {
    sessionStorage.setItem("siteReviewDismissed", "true");
    setShowReview(false);
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this review!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("footyhubToken");
        await axios.delete(`https://footyhub-backend-cqir.onrender.com/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your review has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchReviews(); // Refresh the reviews list
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete review.",
        });
      }
    }
  };

  const handleVote = async (player) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to vote in the poll.",
      });
      return;
    }
    if (voted) return;

    try {
      const token = localStorage.getItem("footyhubToken");
      const response = await axios.post(
        "https://footyhub-backend-cqir.onrender.com/api/poll/vote",
        { player },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setVotes({
        messi: response.data.totalMessi,
        ronaldo: response.data.totalRonaldo,
      });
      setVoted(true);
      const updatedUser = { ...user, votedPlayer: player };
      updateUser(updatedUser);
      Swal.fire({
        icon: "success",
        title: "Vote Recorded!",
        text: "Thank you for voting.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error voting:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to record vote.",
      });
    }
  };

  const handleViewMoreFixtures = () => {
    navigate("/fixtures");
    window.scrollTo(0, 0);
  };

  const handleLoadMoreReviews = () => {
    setVisibleReviews(prev => prev + 5);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div className="mainpage-container relative min-h-screen flex flex-col text-black bg-gray-50">
      {!showReview && <Header />}

      {/* Hero Section */}
      <div className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden pt-[56px] md:pt-[70px]">
        <video
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover z-0 scale-105 md:scale-100"
          src="../Public/FootyHub.mp4"
        />
        {user && !user.isAdmin && (
          <button
            onClick={() => setShowReview(true)}
            className="absolute top-[140px] left-8 z-50 text-green-400 font-medium text-sm hover:text-green-600 transition-colors duration-300"
          >
            Give Feedback
          </button>
        )}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 ${
            showReview ? "" : "bg-black bg-opacity-60"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-400 drop-shadow-lg mb-4 animate-fadeIn">
            Welcome to FootyHub ⚽
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-2xl mb-6 animate-fadeIn">
            Live Scores, Fixtures, Highlights & Everything Football — All in One
            Place.
          </p>
          <button
            onClick={() => navigate("/footyhub/explore")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer animate-fadeIn"
          >
            Explore Now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10 space-y-12 md:space-y-16 px-3 sm:px-4 md:px-12">
        {/* Upcoming Fixtures Section */}
        <section className="bg-white p-4 md:p-8 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">
              Upcoming Fixtures
            </h2>
            <button
              onClick={handleViewMoreFixtures}
              className="text-green-500 font-semibold hover:underline cursor-pointer text-sm md:text-base"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {upcomingFixtures.map((match, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 md:p-6 rounded-lg shadow flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-start md:items-center"
              >

                <div className="font-semibold text-gray-800 mb-2 md:mb-0">
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-gray-500 text-sm">
                  {match.date} | {match.time}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rumours Section */}
        <section className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Latest Football Rumours
          </h2>
          <div className="flex flex-col space-y-4">
            <div className="border-b border-gray-300 pb-3">
              <span className="font-bold text-green-500">
                Manchester United Eye New Midfielder:{" "}
              </span>
              Rumors suggest Manchester United are interested in signing a top
              midfielder to bolster their squad for the Premier League and
              Champions League.
            </div>
            <div className="border-b border-gray-300 pb-3">
              <span className="font-bold text-green-500">
                Barcelona Target Young Striker:{" "}
              </span>
              Barcelona are reportedly scouting a young striker from La Liga to
              strengthen their attacking options.
            </div>
            <div className="border-b border-gray-300 pb-3">
              <span className="font-bold text-green-500">
                Juventus Looking to Sell Veteran Defender:{" "}
              </span>
              Juventus may offload one of their veteran defenders during the
              winter transfer window.
            </div>
          </div>
          <div className="text-right mt-4">
            <button
              onClick={() => {
                navigate("/news");
                window.scrollTo(0, 0);
              }}
              className="text-green-500 font-semibold hover:underline cursor-pointer"
            >
              View More
            </button>
          </div>
        </section>

        {/* Products Section */}
        <section className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Shop Football Gear
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {mainProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center hover:shadow-xl transition cursor-pointer"
              >
                <img
                  src={`http://localhost:5000${product.img}`}
                  alt={product.name}
                  className="w-full max-w-40 sm:max-w-48 md:max-w-56 h-auto object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-green-500 font-semibold text-lg mb-4">
                  {product.price}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => {
                navigate("/shop");
                window.scrollTo(0, 0);
              }}
              className="text-green-500 font-semibold hover:underline cursor-pointer text-lg"
            >
              View More
            </button>
          </div>
        </section>

        {/* Fan Poll Section */}
        {user && !user.isAdmin && (
          <section className="bg-white p-10 rounded-2xl shadow-xl text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              ⚽ Fan Poll
            </h2>
            <p className="text-gray-600 mb-10">
              Who’s the Greatest of All Time?
            </p>
            <div className="flex justify-center gap-16 flex-wrap">
              {/* Messi */}
              <div className="flex flex-col items-center bg-gray-100 p-6 sm:p-8 rounded-2xl shadow-md w-full sm:w-72 hover:shadow-xl transition-all cursor-pointer">
                <img
                  src="./public/Players/LEO.jpeg"
                  alt="Messi"
                  className="w-56 h-56 object-cover rounded-full mb-4 border-4 border-green-400 shadow-md hover:scale-105 transition-transform cursor-pointer"
                />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Messi
                </h3>
                <p className="text-gray-600 mb-3 text-lg">
                  Votes: {votes.messi}
                </p>
                <button
                  onClick={() => handleVote("messi")}
                  disabled={voted}
                  className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition cursor-pointer ${
                    voted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  Vote
                </button>
              </div>
              {/* Ronaldo */}
              <div className="flex flex-col items-center bg-gray-100 p-6 sm:p-8 rounded-2xl shadow-md w-full sm:w-72 hover:shadow-xl transition-all cursor-pointer">
                <img
                  src="./public/Players/CR7.jpeg"
                  alt="Ronaldo"
                  className="w-56 h-56 object-cover rounded-full mb-4 border-4 border-green-400 shadow-md hover:scale-105 transition-transform cursor-pointer"
                />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Ronaldo
                </h3>
                <p className="text-gray-600 mb-3 text-lg">
                  Votes: {votes.ronaldo}
                </p>
                <button
                  onClick={() => handleVote("ronaldo")}
                  disabled={voted}
                  className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition cursor-pointer ${
                    voted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  Vote
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 🔹 Site Reviews Section */}
        <section className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Site Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to give feedback!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {reviews.slice(0, visibleReviews).map((review) => (
                  <div
                    key={review._id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {(review.user?.name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {review.user?.name || "Anonymous"}
                        </h3>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      "{review.comment}"
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    {user && user._id === review.user?._id && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {visibleReviews < reviews.length && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMoreReviews}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* 🔹 Review Popup */}
      {showReview && user && !user.isAdmin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/40 pointer-events-none"></div>

          {/* Popup */}
          <div className="relative z-50">
            <ReviewPopup
              onClose={handleCloseReview}
              user={user}
              refreshReviews={fetchReviews}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MainPage;
