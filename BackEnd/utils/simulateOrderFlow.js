import Notification from "../models/Notification.js";

export const simulateOrderFlow = async (req, userId, orderId) => {
  const stages = [
    { title: "Order Confirmed", message: "Your order has been confirmed.", delay: 0 },
    { title: "Processing your order", message: "We are processing your order.", delay: 20000 },
    { title: "Shipped your order", message: "Your order has been shipped.", delay: 40000 },
    { title: "Out for Delivery", message: "Your order is out for delivery.", delay: 60000 },
    { title: "Delivered", message: "Your order has been delivered.", delay: 120000 },
  ];

  stages.forEach(({ title, message, delay }) => {
    setTimeout(async () => {
      const notif = await Notification.create({ title, message, user: userId, orderId });

      // Emit to user if online
      const socketId = req.onlineUsers.get(userId);
      if (socketId) req.io.to(socketId).emit("new-notification", notif);
    }, delay);
  });
};
