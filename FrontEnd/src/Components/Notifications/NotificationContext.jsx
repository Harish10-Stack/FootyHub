import { createContext, useEffect, useState } from "react";
import socket from "../utils/socket";
import { useAuth } from "../Explore/AuthContext.jsx";
import toast from "react-hot-toast";
import api from "../utils/api.js";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Register user for socket notifications
    socket.emit("register-user", user._id);

    // Fetch existing notifications
    api.get(`/notifications/${user._id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Failed to fetch notifications:", err));

    // Handle incoming socket notifications
    const handleSocketNotification = (data) => {
      toast.success(data.message, {
        position: "top-center",
        style: { maxWidth: "90vw", wordBreak: "break-word" },
      });
      setNotifications(prev => [data, ...prev]);
    };

    socket.on("notification", handleSocketNotification);

    // Cleanup listener on unmount or user change
    return () => socket.off("notification", handleSocketNotification);
  }, [user]);

  // Mark all notifications as read
  const markAllRead = async () => {
    if (!user) return;
    try {
      await api.put(`/notifications/read/${user._id}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  // Remove single notification
  const removeNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await api.delete(`/notifications/delete/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    setNotifications([]);
    try {
      await api.delete(`/notifications/delete-all`);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      markAllRead,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

