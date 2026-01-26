import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import Swal from "sweetalert2";
import NewsHeader from "../Headers/NewsHeader.jsx";
import Footer from "../Home/Footer.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { Calendar, MessageCircle, Heart, ThumbsUp, Laugh, Frown, Angry, Meh, Trash2 } from "lucide-react";

const emojiList = ["👍", "❤️", "😂", "😮", "😢", "👎"];

const NewsFeed = () => {
  const [newsData, setNewsData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [comments, setComments] = useState({});
  const [reactions, setReactions] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showCommentsPopup, setShowCommentsPopup] = useState({});
  const { user } = useAuth();

  // Fetch news from backend
  useEffect(() => {
    fetchNews();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Polling for real-time updates
    const interval = setInterval(fetchNews, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchNews = async () => {
    try {
      const { data } = await api.get("/news");
      setNewsData(data);

      // Fetch comments and reactions for each news item
      const commentsData = {};
      const reactionsData = {};
      await Promise.all(
        data.map(async (n) => {
          const [commentsRes, reactionsRes] = await Promise.all([
            api.get(`/news/${n._id}/comments`),
            api.get(`/news/${n._id}/reactions`)
          ]);
          commentsData[n._id] = commentsRes.data;
          reactionsData[n._id] = reactionsRes.data;
        })
      );
      setComments(commentsData);
      setReactions(reactionsData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  // Handle emoji reaction
  const handleReaction = async (newsId, emoji) => {
    if (!user) return alert("Login to react!");
    try {
      await api.post(`/news/${newsId}/react`, { emoji });
      fetchNews();  
    } catch (err) {
      console.error("Reaction error:", err.response?.data || err);
    }
  };

   // Handle adding comment
  const handleAddComment = async (newsId) => {
    const text = commentInput[newsId];
    if (!user || !text?.trim()) return;

    try {
      await api.post(`/news/${newsId}/comment`, { text });
      setCommentInput((prev) => ({ ...prev, [newsId]: "" }));
      setShowCommentBox((prev) => ({ ...prev, [newsId]: false }));
      fetchNews();
    } catch (err) {
      console.error("Comment error:", err.response?.data || err);
    }
  };

  // Handle deleting comment
  const handleDeleteComment = async (newsId, commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this comment!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/news/${newsId}/comment/${commentId}`);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your comment has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchNews(); // Refresh the comments list
      } catch (error) {
        console.error("Error deleting comment:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete comment.",
        });
      }
    }
  };

  const loadMore = () =>
    setVisibleCount((prev) => Math.min(prev + 2, newsData.length));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-900">
      <NewsHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">

            Latest Football Rumours
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Stay ahead of the game with the most recent transfer news, player updates, and breaking stories from the world of football.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {newsData.slice(0, visibleCount).map((news, index) => (
            <article
              key={news._id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-green-700">
                  <Calendar size={20} />
                  <span className="font-semibold text-lg">
                    {new Date(news.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {news.title}
                  </span>
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {news.description}
                </p>
              </div>

              {/* Interactions */}
              {user && !user.isAdmin && (
                <div className="px-6 pb-6">
                  {/* Reactions */}
                  <div className="flex justify-center mb-4">
                    <div className="flex gap-2">
                      {emojiList.map((e) => {
                        const count = (reactions[news._id] || []).filter(r => r.emoji === e).length;
                        return (
                          <button
                            key={e}
                            className="group relative p-2 rounded-full hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                            onClick={() => handleReaction(news._id, e)}
                          >
                            <span className="text-2xl group-hover:animate-bounce">{e}</span>
                            {count > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-semibold">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment Button */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-md group"
                        onMouseEnter={() =>
                          setShowCommentsPopup((prev) => ({
                            ...prev,
                            [news._id]: true,
                          }))
                        }
                        onMouseLeave={() =>
                          setShowCommentsPopup((prev) => ({
                            ...prev,
                            [news._id]: false,
                          }))
                        }
                        onClick={() =>
                          setShowCommentBox((prev) => ({
                            ...prev,
                            [news._id]: !prev[news._id],
                          }))
                        }
                      >
                        <MessageCircle size={18} className="text-gray-600 group-hover:text-green-600" />
                        <span className="text-gray-700 font-medium">
                          {(comments[news._id] || []).length > 0 ? `${(comments[news._id] || []).length} Comments` : 'Add Comment'}
                        </span>
                      </button>

                      {/* Comments Preview */}
                      {showCommentsPopup[news._id] && (comments[news._id] || []).length > 0 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64 sm:w-80 max-h-60 overflow-y-auto z-20">
                          <div className="text-sm text-gray-600 mb-3 font-semibold border-b pb-2">
                            Recent Comments ({(comments[news._id] || []).length})
                          </div>
                          <div className="space-y-3">
                            {(comments[news._id] || []).slice(0, 3).map((c) => (
                              <div
                                key={c._id}
                                className="flex gap-3 p-2 bg-gray-50 rounded-lg"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {c.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-green-700 text-sm">{c.user.name}</div>
                                  <div className="text-gray-700 text-sm leading-relaxed">
                                    {c.text.length > 60 ? `${c.text.substring(0, 60)}...` : c.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(comments[news._id] || []).length > 3 && (
                              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                                +{(comments[news._id] || []).length - 3} more comments
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Input */}
                  {showCommentBox[news._id] && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Share your thoughts..."
                            value={commentInput[news._id] || ""}
                            onChange={(e) =>
                              setCommentInput((prev) => ({
                                ...prev,
                                [news._id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(news._id);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-full w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                          <button
                            onClick={() => handleAddComment(news._id)}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Post
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      {comments[news._id] && comments[news._id].length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-3 bg-gray-50 rounded-xl p-4">
                          {(comments[news._id] || []).map((c) => (
                            <div
                              key={c._id}
                              className="flex gap-3 p-3 bg-white rounded-lg shadow-sm"
                            >
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {c.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">{c.user.name}</div>
                                <div className="text-gray-700 text-sm leading-relaxed">{c.text}</div>
                              </div>
                              {user && c.user._id === user._id && (
                                <button
                                  onClick={() => handleDeleteComment(news._id, c._id)}
                                  className="text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0"
                                  title="Delete comment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Load More */}
        {visibleCount < newsData.length && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Load More Rumours</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}

        {/* Empty State */}
        {newsData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Rumours Yet</h3>
            <p className="text-gray-500">Check back later for the latest football news and updates.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsFeed;


