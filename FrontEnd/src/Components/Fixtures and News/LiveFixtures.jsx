import React, { useState, useEffect } from "react";
import axios from "axios";
import FixturesHeader from "../Headers/FixturesHeader.jsx";
import Footer from "../Home/Footer.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { Calendar, MessageCircle, Trophy, Users, Search, Trash2 } from "lucide-react";

const emojiList = ["👍", "❤️", "😂", "😮", "😢", "👎"];

const FixturesPage = () => {
  const [fixtures, setFixtures] = useState([]);
  const [activeTab, setActiveTab] = useState("leagues");
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState({});
  const [reactions, setReactions] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showCommentsPopup, setShowCommentsPopup] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchFixtures();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Polling for real-time updates
    const interval = setInterval(fetchFixtures, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchFixtures = async () => {
    try {
      const { data } = await axios.get("https://footyhub-backend-cqir.onrender.com/api/fixtures");
      setFixtures(data);

      // Fetch comments and reactions for each fixture
      const commentsData = {};
      const reactionsData = {};
      await Promise.all(
        data.map(async (f) => {
          const [commentsRes, reactionsRes] = await Promise.all([
            axios.get(`https://footyhub-backend-cqir.onrender.com/api/fixtures/${f._id}/comments`),
            axios.get(`https://footyhub-backend-cqir.onrender.com/api/fixtures/${f._id}/reactions`)
          ]);
          commentsData[f._id] = commentsRes.data;
          reactionsData[f._id] = reactionsRes.data;
        })
      );
      setComments(commentsData);
      setReactions(reactionsData);
    } catch (err) {
      console.error(err);
    }
  };

  const leaguesData = fixtures.reduce((acc, f) => {
    const leagueExists = acc.find((l) => l.name === f.league);
    if (leagueExists) leagueExists.fixtures.push(f);
    else acc.push({ name: f.league, fixtures: [f] });
    return acc;
  }, []);

  const clubsData = fixtures.reduce((acc, f) => {
    [f.home, f.away].forEach((club) => {
      const clubExists = acc.find((c) => c.name === club);
      if (clubExists) clubExists.fixtures.push(f);
      else acc.push({ name: club, fixtures: [f] });
    });
    return acc;
  }, []);

  const filterData = (data) =>
    data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const dataToDisplay =
    activeTab === "leagues" ? filterData(leaguesData) : filterData(clubsData);

  // Handle emoji reaction
  const handleReaction = async (fixtureId, emoji) => {
    if (!user) return alert("Login to react!");
    try {
      await axios.post(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/react`,
        { emoji },
        { withCredentials: true }
      );
      fetchFixtures();
    } catch (err) {
      console.error("Reaction error:", err.response?.data || err);
    }
  };

  // Handle adding comment
  const handleAddComment = async (fixtureId) => {
    const text = commentInput[fixtureId];
    if (!user || !text?.trim()) return;

    try {
      await axios.post(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/comment`,
        { text },
        { withCredentials: true }
      );
      setCommentInput((prev) => ({ ...prev, [fixtureId]: "" }));
      setShowCommentBox((prev) => ({ ...prev, [fixtureId]: false }));
      fetchFixtures();
    } catch (err) {
      console.error("Comment error:", err.response?.data || err);
    }
  };

  // Handle deleting comment
  const handleDeleteComment = async (fixtureId, commentId) => {
    if (!user) return;

    try {
      await axios.delete(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/comment/${commentId}`,
        { withCredentials: true }
      );
      fetchFixtures();
    } catch (err) {
      console.error("Delete comment error:", err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-900">
      <FixturesHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Live Fixtures
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Stay updated with the latest match schedules, league standings, and team performances across all competitions.
          </p>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab === "leagues" ? "Leagues" : "Clubs"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === "leagues"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("leagues")}
              >
                <Trophy size={18} />
                Leagues
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === "clubs"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("clubs")}
              >
                <Users size={18} />
                Clubs
              </button>
            </div>
          </div>
        </div>

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {dataToDisplay.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">⚽</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No Fixtures Found</h3>
              <p className="text-gray-500">Try adjusting your search or check back later for updates.</p>
            </div>
          ) : (
            dataToDisplay.map((item) => (
              <article
                key={item.name}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 text-green-700">
                    {activeTab === "leagues" ? <Trophy size={20} /> : <Users size={20} />}
                    <h2 className="text-2xl font-bold">{item.name}</h2>
                  </div>
                </div>

                {/* Fixtures */}
                <div className="p-6 space-y-4">
                  {item.fixtures.map((f) => (
                    <div
                      key={f._id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                      {/* Teams */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {f.home.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-900">{f.home}</div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600 mb-1">VS</div>
                          <div className="text-sm text-gray-500">Match</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-bold text-lg text-gray-900 text-right">{f.away}</div>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {f.away.charAt(0)}
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 text-gray-600 mb-4">
                        <Calendar size={16} />
                        <span className="font-medium">
                          {new Date(f.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {f.time}
                        </span>
                      </div>

                      {/* Interactions */}
                      {user && !user.isAdmin && (
                        <div className="border-t border-gray-200 pt-4">
                          {/* Reactions */}
                         <div className="flex flex-wrap justify-center mb-4 gap-2">
                            <div className="flex gap-2">
                              {emojiList.map((e) => {
                                const count = (reactions[f._id] || []).filter(r => r.emoji === e).length;
                                return (
                                  <button
                                    key={e}
                                    className="group relative p-2 rounded-full hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                                    onClick={() => handleReaction(f._id, e)}
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
                                    [f._id]: true,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setShowCommentsPopup((prev) => ({
                                    ...prev,
                                    [f._id]: false,
                                  }))
                                }
                                onClick={() =>
                                  setShowCommentBox((prev) => ({
                                    ...prev,
                                    [f._id]: !prev[f._id],
                                  }))
                                }
                              >
                                <MessageCircle size={18} className="text-gray-600 group-hover:text-green-600" />
                                <span className="text-gray-700 font-medium">
                                  {(comments[f._id] || []).length > 0 ? `${(comments[f._id] || []).length} Comments` : 'Add Comment'}
                                </span>
                              </button>

                              {/* Comments Preview */}
                              {showCommentsPopup[f._id] && (comments[f._id] || []).length > 0 && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80 max-h-60 overflow-y-auto z-20">
                                  <div className="text-sm text-gray-600 mb-3 font-semibold border-b pb-2">
                                    Recent Comments ({(comments[f._id] || []).length})
                                  </div>
                                  <div className="space-y-3">
                                    {(comments[f._id] || []).slice(0, 3).map((c) => (
                                      <div
                                        key={c._id}
                                        className="flex gap-3 p-2 bg-gray-50 rounded-lg"
                                      >
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                          {(c.user?.name || "A").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-semibold text-green-700 text-sm">{c.user?.name || "Anonymous"}</div>
                                          <div className="text-gray-700 text-sm leading-relaxed">
                                            {c.text.length > 60 ? `${c.text.substring(0, 60)}...` : c.text}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {(comments[f._id] || []).length > 3 && (
                                      <div className="text-xs text-gray-500 text-center pt-2 border-t">
                                        +{(comments[f._id] || []).length - 3} more comments
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Comment Input */}
                          {showCommentBox[f._id] && (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Share your thoughts..."
                                    value={commentInput[f._id] || ""}
                                    onChange={(e) =>
                                      setCommentInput((prev) => ({
                                        ...prev,
                                        [f._id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleAddComment(f._id);
                                    }}
                                     className="flex-1 w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                  />
                                  <button
                                    onClick={() => handleAddComment(f._id)}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                                  >
                                    Post
                                  </button>
                                </div>
                              </div>

                              {/* Comments List */}
                              {comments[f._id] && comments[f._id].length > 0 && (
                                <div className="max-h-60 overflow-y-auto space-y-3 bg-gray-50 rounded-xl p-4">
                                  {(comments[f._id] || []).map((c) => (
                                    <div
                                      key={c._id}
                                      className="flex gap-3 p-3 bg-white rounded-lg shadow-sm"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {(c.user?.name || "A").charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900 text-sm">{c.user?.name || "Anonymous"}</div>
                                        <div className="text-gray-700 text-sm leading-relaxed">{c.text}</div>
                                      </div>
                                      {user && c.user?._id === user._id && (
                                        <button
                                          onClick={() => handleDeleteComment(f._id, c._id)}
                                          className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
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
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FixturesPage;
