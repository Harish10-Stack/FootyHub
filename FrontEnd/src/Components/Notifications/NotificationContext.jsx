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

      api.get(`/notifications/${user._id}`)
        .then(res => res.data)
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
    await api.put(`/notifications/read/${user._id}`);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
