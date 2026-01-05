import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Review from "../models/productReviewModel.js";
import { defaultNotifications } from "../data/defaultNotifications.js";

// Send welcome notification to the logged-in user
export const sendWelcomeNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const notification = await Notification.create({
    title: "🎉 Welcome Back!",
    message: `Hi ${user.name}, glad to see you again 😊`,
    user: userId,
    type: "welcome",
  });

  // Send in real-time if user socket is online
  const socketId = req.onlineUsers?.get(userId.toString());
  if (socketId) {
    req.io.to(socketId).emit("new-notification", notification);
  }

  res.status(201).json(notification);
});

// -------------------- ADD THIS FUNCTION --------------------
const simulateOrderFlow = async (req, userId, orderId) => {
  const stages = [
    { title: "Order Confirmed", type: "order", delay: 0 },
    { title: "Order Processing", type: "order", delay: 20000 },
    { title: "In Transit", type: "shipping", delay: 40000 },
    { title: "Out for Delivery", type: "delivery", delay: 60000 },
    { title: "Delivered", type: "delivery", delay: 70000 },
    { title: "Review Request", type: "system", delay: 75000 },
  ];

  for (const { title, type, delay } of stages) {
    setTimeout(async () => {
      const message =
        title === "Review Request"
          ? "Your order is delivered. Would you like to leave a review?"
          : `Status Update: ${title}`;

      const notif = await Notification.create({
        title,
        message,
        type,
        user: userId,
        orderId, // optional: attach order reference
      });

      const socketId = req.onlineUsers.get(userId.toString());
      if (socketId) req.io.to(socketId).emit("new-notification", notif);
    }, delay);
  }
};
// ------------------------------------------------------------


// Admin: Create a notification
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, userId } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("Title and message are required");
  }

  // If sending to a single user
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const notification = await Notification.create({
      title,
      message,
      user: userId,
    });

    // Emit live notification if the user is online
    const socketId = req.onlineUsers.get(userId.toString());
    console.log(`🔔 Sending notification to user ${userId}, socketId: ${socketId}`);
    if (socketId) {
      req.io.to(socketId).emit("new-notification", notification);
      console.log(`✅ Notification emitted to socket ${socketId}:`, notification);
    } else {
      console.log(`❌ User ${userId} not found in onlineUsers map`);
    }

    return res.status(201).json(notification);
  }

  // Send to all users
  const users = await User.find({});
  const notificationsData = users.map((u) => ({
    title,
    message,
    user: u._id,
  }));

  const createdNotifications = await Notification.insertMany(notificationsData);

  // Emit to online users
  users.forEach((u) => {
    const socketId = req.onlineUsers.get(u._id.toString());
    if (socketId) {
      const userNotification = createdNotifications.find(
        (n) => n.user.toString() === u._id.toString()
      );
      req.io.to(socketId).emit("new-notification", userNotification);
    }
  });

  res.status(201).json(createdNotifications);
});

// User: Get notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId, read: false }).sort({
    createdAt: -1,
  }).populate('sender', 'name _id');
  res.json(notifications);
});

// Mark a notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.read = true;
  await notification.save();
  res.json({ message: "Notification marked as read" });
});

// Optional: Mark all notifications as read
export const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.updateMany({ user: userId, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
});

// Delete all notifications for the user
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.deleteMany({ user: userId });
  res.json({ message: "All notifications deleted" });
});

// New: Get default notifications
export const getDefaultNotifications = asyncHandler(async (req, res) => {
  res.json(defaultNotifications);
});

// Send default notification
export const sendDefaultNotification = asyncHandler(async (req, res) => {
  const { index } = req.params;
  const { userIds } = req.body;
  const idx = parseInt(index, 10);

  if (isNaN(idx) || idx < 0 || idx >= defaultNotifications.length) {
    res.status(400);
    throw new Error("Invalid notification index");
  }

  const notificationData = defaultNotifications[idx];

  let users;
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    users = await User.find({ _id: { $in: userIds } });
  } else {
    users = await User.find({});
  }

  const notificationsToCreate = users.map((u) => ({
    title: notificationData.title,
    message: notificationData.message,
    user: u._id,
  }));

  const createdNotifications = await Notification.insertMany(notificationsToCreate);

  users.forEach((u) => {
    const socketId = req.onlineUsers.get(u._id.toString());
    if (socketId) {
      const userNotification = createdNotifications.find(
        (n) => n.user.toString() === u._id.toString()
      );
      req.io.to(socketId).emit("new-notification", userNotification);
    }
  });

  res.status(201).json({
    message: `Notification "${notificationData.title}" sent to ${users.length} user(s).`,
  });
});

export const getStoredNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 });
  res.json(notifications);
});

// Send stored notification
export const sendStoredNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;
  const notificationToSend = await Notification.findById(id);

  if (!notificationToSend) {
    res.status(404);
    throw new Error("Stored notification not found");
  }

  let users;
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    users = await User.find({ _id: { $in: userIds } });
  } else {
    users = await User.find({});
  }

  const notificationsToCreate = users.map((u) => ({
    title: notificationToSend.title,
    message: notificationToSend.message,
    user: u._id,
  }));

  const createdNotifications = await Notification.insertMany(notificationsToCreate);

  users.forEach((u) => {
    const socketId = req.onlineUsers.get(u._id.toString());
    if (socketId) {
      const userNotification = createdNotifications.find(
        (n) => n.user.toString() === u._id.toString()
      );
      req.io.to(socketId).emit("new-notification", userNotification);
    }
  });

  res.status(201).json({
    message: `Stored notification "${notificationToSend.title}" sent to ${users.length} user(s).`,
  });
});

// Get admin messages (product reviews for now)
export const getAdminMessages = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(reviews);
});





