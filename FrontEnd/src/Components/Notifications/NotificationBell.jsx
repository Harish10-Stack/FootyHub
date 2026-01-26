import React, { useEffect, useState, useRef } from "react";
import { Bell, Trash2, Volume2, VolumeX, MessageSquare } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import ReviewPopup from "./ReviewPopup.jsx";
import SendNotification from "./SendNotification.jsx";
import { notificationTheme } from "../Notifications/NotificationStyles.js";
import { useAuth } from "../Explore/AuthContext.jsx"; // For user info
import socket from "../../utils/socket.js";
import api from "../../utils/api.js";
  
function NotificationItem({ notif, onClose, onSendMessage }) {
  const style = notificationTheme[notif.type] || notificationTheme.system;

  return (
    <div
      className="notification-card flex flex-col sm:flex-row sm:items-center gap-4 shadow-md p-4 mb-3 rounded-lg transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-lg cursor-pointer"
      style={{ backgroundColor: style.bg, borderLeft: `5px solid ${style.color}` }}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClose(notif._id);
          e.preventDefault();
        }
      }}
    >
      <div aria-hidden="true" style={{ fontSize: "28px" }}>{style.icon}</div>

      <div className="flex-1">
        <p className="font-semibold text-base sm:text-lg break-words" style={{ color: style.color }}>
          {notif.title}
        </p>
        <p className="text-gray-700 text-sm mt-1 break-words">
          {notif.message}
        </p>

        <span className="text-xs text-gray-400 block mt-2">
          {new Date(notif.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="flex gap-2">
        {notif.type === "admin-talk" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendMessage(notif);
            }}
            className="text-blue-500 hover:text-blue-700 text-lg transition-colors p-2 rounded-md"
            title="Send Message"
          >
            <MessageSquare size={20} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(notif._id);
          }}
          className="text-gray-500 hover:text-red-600 text-lg transition-colors p-2 rounded-md"
        >
          ✖
        </button>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { user, notifications, removeNotification: removeFromContext, clearNotifications } = useAuth(); // Get user info and notifications from context
  const [open, setOpen] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(null);
  const [showSendNotification, setShowSendNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const dropdownRef = useRef(null);
  const audioRef = useRef(new Audio("/Sound/Notify.wav"));

  // Load sound once
  useEffect(() => audioRef.current.load(), []);

  const playSound = () => {
    if (soundEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };



  const removeNotification = async (id) => {
    removeFromContext(id); // Optimistic update
    try {
      await api.delete(`/notifications/delete/${id}`);
    } catch (err) {
      console.error(err);
      // If failed, could add back, but for now leave removed
    }
  };

  const removeAllNotifications = async () => {
    clearNotifications(); // Optimistic update
    setClearing(true);
    setTimeout(async () => {
      try {
        await api.delete("/notifications/delete-all");
      } catch (err) {
        console.error(err);
        // If failed, could refetch, but for now leave cleared
      }
      setClearing(false);
    }, 300);
  };

  const handleDeliveryConfirmationClick = (notif) => {
    if (notif.title === "Review Request") {
      setShowReviewPopup({ productId: notif.productId, notifId: notif._id });
      removeNotification(notif._id);
    }
  };

  const handleSendMessage = (notif) => {
    setShowSendNotification({ userId: notif.sender, userName: notif.title });
    removeNotification(notif._id);
  };

  // ----------------------------
  // 🔥 Play sound on new notifications
  // ----------------------------
  useEffect(() => {
    if (notifications.length > 0) {
      playSound();
    }
  }, [notifications.length]);

  useEffect(() => {
    const listener = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };

    if (open) document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [open]);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className={`relative p-3 rounded-full border shadow-md ${bellAnimating ? "animate-bounce text-green-500" : ""}`}
        >
          <Bell size={24} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center justify-center">
              {notifications.length}
            </span>   
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-[90vw] sm:w-96 bg-gray-50 border rounded-xl shadow-lg z-50 animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell size={20} /> Notifications
              </h3>

              <div className="flex gap-2 items-center">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 hover:bg-gray-200 rounded-md">
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {notifications.length > 0 && (
                  <button onClick={removeAllNotifications} disabled={clearing} className="px-3 py-1 bg-red-500 text-white rounded-md">
                    {clearing ? "Clearing..." : "Clear All"}
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-80 p-5">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No notifications yet</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} onClick={() => handleDeliveryConfirmationClick(notif)}>
                    <NotificationItem notif={notif} onClose={removeNotification} onSendMessage={handleSendMessage} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showReviewPopup && (
        <ReviewPopup
          productId={showReviewPopup.productId}
          notifId={showReviewPopup.notifId}
          onClose={() => setShowReviewPopup(null)}
        />
      )}

      {showSendNotification && (
        <SendNotification
          userId={showSendNotification.userId}
          userName={showSendNotification.userName}
          onClose={() => setShowSendNotification(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn .25s ease-out; }
      `}</style>
    </>
  );
}



