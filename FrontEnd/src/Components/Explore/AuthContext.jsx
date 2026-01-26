import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../../utils/socket.js";
import api from "../../utils/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // -----------------------------------------
  // Load user from backend
  // -----------------------------------------
  const loadUser = async () => {
    const token = localStorage.getItem("footyhubToken"); // ✅ declare token

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const { data } = await api.get("/users/profile");
      setUser(data);
    } catch (err) {
      localStorage.removeItem("footyhubToken");
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setLoading(false);
    };
    init();
  }, []);

  // -----------------------------------------
  // Fetch notifications
  // -----------------------------------------
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data: notifs } = await api.get("/notifications/my");
      const filteredNotifs = user?.isAdmin
        ? notifs.filter((n) => n.type === "admin-talk")
        : notifs;
      setNotifications(filteredNotifs);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // -----------------------------------------
  // Login
  // -----------------------------------------
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/users/login", { email, password }); // ✅ added `data`
      
      // 🔥 SAVE TOKEN
      if (data?.token) {
        localStorage.setItem("footyhubToken", data.token);
      }

      await loadUser();
    } catch (err) {
      console.error("Login error:", err.response?.data);
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  // -----------------------------------------
  // Register
  // -----------------------------------------
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/users/register", { name, email, password });

      // 🔥 SAVE TOKEN
      if (data?.token) {
        localStorage.setItem("footyhubToken", data.token);
      }

      await loadUser();
    } catch (err) {
      console.error("Register error:", err.response?.data);
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  // -----------------------------------------
  // Update user state
  // -----------------------------------------
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // -----------------------------------------
  // Save delivery address
  // -----------------------------------------
  const saveDeliveryAddress = async (addressObj) => {
    try {
      const { data } = await api.put("/users/delivery-address", addressObj);
      await loadUser();
      return data.deliveryAddress || null;
    } catch (err) {
      console.error("saveDeliveryAddress error:", err);
      throw err;
    }
  };

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("footyhubToken");

      socket.off(); // 🔥 clear all listeners
      socket.disconnect();

      setUser(null);
      setNotifications([]);
    }
  };

  // -----------------------------------------
  // Socket notifications
  // -----------------------------------------
  useEffect(() => {
    if (!socket._notificationListener) {
      socket._notificationListener = true;

      socket.on("new-notification", (notif) => {
        console.log("📩 NEW LIVE NOTIFICATION:", notif);
        setNotifications((prev) => [notif, ...prev]);
      });
    }

    const registerUser = () => {
      if (user?._id && socket.connected) {
        socket.emit("register-user", user._id);
        console.log("👤 User registered for notifications:", user._id);
      }
    };

    registerUser();

    socket.on("connect", registerUser);
    socket.on("reconnect", registerUser);

    return () => {
      socket.off("connect");
      socket.off("reconnect");
      if (!user?._id) socket.off("new-notification");
    };
  }, [user]);

  // -----------------------------------------
  // Notification management
  // -----------------------------------------
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        saveDeliveryAddress,
        notifications,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

