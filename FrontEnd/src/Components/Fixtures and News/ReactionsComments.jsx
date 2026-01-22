import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../Explore/AuthContext.jsx";
import { Trash2 } from "lucide-react";

const emojiList = ["👍", "❤️", "😂", "😮", "😢", "👎"];

const ReactionsComments = ({ fixtureId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [reactions, setReactions] = useState({}); // { '👍': 0, '❤️': 0, ... }

  // Fetch comments & reactions for this fixture
  const fetchData = async () => {
    try {
      const { data: commentsData } = await axios.get(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/comments`,
        {
          headers: user
            ? { Authorization: `Bearer ${localStorage.getItem("footyhubToken")}` }
            : {},
        }
      );

      // Compute emoji counts
      const { data: fixtureData } = await axios.get(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures`
      );
      const fixture = fixtureData.find((f) => f._id === fixtureId);
      const emojiCounts = {};
      emojiList.forEach((e) => {
        emojiCounts[e] = fixture?.reactions.filter((r) => r.emoji === e).length || 0;
      });

      setComments(commentsData);
      setReactions(emojiCounts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fixtureId]);

  const handleReaction = async (emoji) => {
    if (!user) return alert("Please login to react!");
    try {
      await axios.post(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/react`,
        { emoji },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("footyhubToken")}` },
        }
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      await axios.post(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${fixtureId}/comment`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("footyhubToken")}` },
        }
      );
      setCommentText("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.isAdmin) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-md mt-4">
      {/* Reactions */}
      <div className="flex flex-wrap gap-3 mb-4 text-2xl">
        {emojiList.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="flex items-center gap-1 px-3 py-2 bg-green-100 rounded-lg hover:bg-green-200 transition font-semibold text-base"
          >
            {emoji} {reactions[emoji] || 0}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {comments.map((c) => (
          <div key={c._id} className="p-2 bg-white rounded-lg shadow-sm flex justify-between items-start">
            <div className="flex-1">
              <span className="font-semibold text-green-500">{c.user.name}:</span> {c.text}
            </div>
            {user && c.user._id === user._id && (
              <button
                onClick={() => handleDeleteComment(c._id)}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                title="Delete comment"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddComment();
          }}
        />
        <button
          onClick={handleAddComment}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default ReactionsComments;



