import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import http from "http";

// Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import fixtureRoutes from "./routes/fixtureRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import siteReviewRoutes from "./routes/siteReviewRoutes.js";
import productreviewRoutes from "./routes/productReviewRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------------
// CORS
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files with CORS headers
// Static files (FIXED for cross-origin images)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    },
  })
);

app.use(express.static(path.join(__dirname, "../FrontEnd/public")));

// ----------------------
// Create server + Socket.io
// ----------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // ✅ include deployed frontend
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // support polling fallback
});

const onlineUsers = new Map();

// Socket.io connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User registered for notifications:", userId);
  });

  socket.on("disconnect", () => {
    [...onlineUsers].forEach(([key, value]) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
    console.log("Socket disconnected:", socket.id);
  });
});

// Attach io and onlineUsers to req
app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// ----------------------
// Routes
// ----------------------
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", siteReviewRoutes);
app.use("/api/product-reviews", productreviewRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



