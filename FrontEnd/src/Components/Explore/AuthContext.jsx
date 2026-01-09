import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../utils/socket"; // ✅ using global socket
import axios from "axios";

const AuthContext = createContext();
const API = "https://footyhub-backend-cqir.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]); // 🔥 Add notifications state

  // -----------------------------------------
  // Load user from session storage
  // -----------------------------------------
  const loadUser = async () => {
    try {
      const res = await fetch(`${API}/api/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    setLoading(false);
  }, []);

  // Fetch notifications when user is loaded
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // -----------------------------------------
// Login
  // -----------------------------------------
  const login = async (email, password) => {
    const res = await fetch(`${API}/api/users/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    await loadUser();

    // Trigger welcome notification after login and user is loaded
    try {
      await fetch(`${API}/api/notifications/welcome`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Welcome notification failed:", err);
    }
  };

  // -----------------------------------------
// Fetch notifications
  // -----------------------------------------
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/api/notifications/my`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const notifs = await res.json();
        let filteredNotifs = notifs;
        if (user?.isAdmin) {
          filteredNotifs = notifs.filter(n => n.type === "admin-talk");
        }
        setNotifications(filteredNotifs);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // -----------------------------------------
  // Register
  // -----------------------------------------
  const register = async (name, email, password) => {
    const res = await fetch(`${API}/api/users/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    await loadUser();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // -----------------------------------------
  // Save delivery address
  // -----------------------------------------
  const saveDeliveryAddress = async (addressObj) => {
    try {
      const res = await fetch(`${API}/api/users/delivery-address`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressObj),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");

      await loadUser();
      return data.deliveryAddress || null;
    } catch (err) {
      console.error("saveDeliveryAddress error:", err);
      throw err;
    }
  };

  // -----------------------------------------
  // Logout — disconnects socket
  // -----------------------------------------
  const logout = () => {
    try {
      fetch(`${API}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      socket.registered = false;
      socket.disconnect();
      setUser(null);
      setNotifications([]);

      console.log("🚪 User logged out & socket disconnected");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // -----------------------------------------------------
  // 🔥 SOCKET LISTENER: push new notifications to state
  // -----------------------------------------------------
  useEffect(() => {
    if (!socket._notificationListener) {
      socket._notificationListener = true;

      socket.on("new-notification", (notif) => {
        console.log("📩 NEW LIVE NOTIFICATION:", notif);
        setNotifications((prev) => [notif, ...prev]);
      });
    }

    // Register user when socket connects or when user changes
    const registerUser = () => {
      if (user?._id && socket.connected) {
        socket.emit("register-user", user._id);
        console.log("👤 User registered for notifications:", user._id);
      } else if (user?._id && !socket.connected) {
        console.log("⏳ Socket not connected yet, will register when connected");
      }
    };

    // Register immediately if already connected
    registerUser();

    // Also register when socket connects
    socket.on("connect", () => {
      console.log("🔗 Socket connected, registering user");
      registerUser();
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected, re-registering user");
      registerUser();
    });

    return () => {
      socket.off("connect");
      socket.off("reconnect");
      if (!user?._id) socket.off("new-notification");
    };
  }, [user]);

  // 🔥 Functions to manage notifications
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
        notifications, // 🔥 Expose notifications
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





