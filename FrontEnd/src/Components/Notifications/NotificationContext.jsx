import { createContext, useEffect, useState } from "react";
import socket from "../utils/socket";
import { useAuth } from "../Explore/AuthContext";
import toast from "react-hot-toast";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit("register-user", user._id);

      fetch(`https://footyhub-backend.onrender.com/api/notifications/${user._id}`)
        .then(res => res.json())
        .then(data => setNotifications(data));

      socket.on("notification", (data) => {
        toast.success(data.message, {
          position: "top-center",
          style: {
            maxWidth: "90vw",
            wordBreak: "break-word",
          },
        });
        setNotifications(prev => [data, ...prev]);
      });
    }
  }, [user]);

  const markAllRead = async () => {
    await fetch(`http://localhost:5000/api/notifications/read/${user._id}`, { method: "PUT" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
