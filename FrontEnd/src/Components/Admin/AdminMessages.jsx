import React, { useState, useEffect } from "react";
import axios from "../Notifications/axiosInstance";
import Swal from "sweetalert2";
import { MessageSquare, User, Calendar } from "lucide-react";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Assuming messages are stored in reviews or a separate messages endpoint
      // For now, we'll fetch product reviews as they contain user messages
      const { data } = await axios.get("/api/notifications/admin/messages");
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Swal.fire("Error", "Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0b1114] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">User Messages</h1>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No Messages</h3>
            <p className="text-gray-500">User messages will appear here once sent.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((message) => (
              <div
                key={message._id}
                className="bg-[#1a1f23] border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {message.user?.name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {message.user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar size={14} />
                    <span className="text-xs">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < message.rating ? "text-yellow-400" : "text-gray-500"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {message.comment || "No message"}
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  Product: {message.product?.name || "Unknown Product"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
