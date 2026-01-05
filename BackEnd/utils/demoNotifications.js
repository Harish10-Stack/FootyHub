import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Function to send welcome back notification to a specific user on login/logout cycle
export const sendWelcomeBackNotification = async (io, onlineUsers, userId) => {
  try {
    const notificationData = {
      title: "Welcome Back",
      message: "Welcome back! We're glad to see you again.",
      icon: "👋",
      category: "general",
    };
    const notification = await Notification.create({
      title: notificationData.title,
      message: notificationData.message,
      user: userId,
      icon: notificationData.icon,
      category: notificationData.category,
    });

    const socketId = onlineUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit("new-notification", notification);
    }
  } catch (error) {
    console.error("Error sending welcome back notification:", error);
  }
};

// Disabled automatic demo notifications to all users
// export const sendDemoNotifications = async (io, onlineUsers) => {
//   // Old automatic sending code removed as per requirement.
// };
