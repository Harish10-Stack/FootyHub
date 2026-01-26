import { io } from "socket.io-client";

const socket = io("https://footyhub-backend-hrqm.onrender.com", {
  withCredentials: true,
  autoConnect: true,
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
});

// Prevent multiple listeners
if (!socket._initialized) {
  socket._initialized = true;
  console.log("🟢 Socket initialized once");

  // Add connection event listeners for debugging
  socket.on("connect", () => {
    console.log("🔗 Socket connected successfully:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  // Add notification listener here as well for redundancy
  socket.on("new-notification", (notification) => {
    console.log("📨 Socket received notification:", notification);
  });
}

export default socket;
