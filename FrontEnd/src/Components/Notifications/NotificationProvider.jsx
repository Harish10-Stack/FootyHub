import React, { createContext, useState, useContext, useRef } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [flyingNotifications, setFlyingNotifications] = useState([]);
  const bellRef = useRef(null);

  const addFlyingNotification = (notification) => {
    setFlyingNotifications((prev) => [...prev, notification]);
  };

  const removeFlyingNotification = (id) => {
    setFlyingNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ flyingNotifications, addFlyingNotification, removeFlyingNotification, bellRef }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
