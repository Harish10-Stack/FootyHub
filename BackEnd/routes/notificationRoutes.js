import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  deleteAllNotifications,
  deleteNotification,
  getDefaultNotifications,
  sendDefaultNotification,
  getStoredNotifications,
  sendStoredNotification,
  getAdminMessages,
  sendWelcomeNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// -------------------- ADMIN ROUTES --------------------
router.post("/", protect, admin, createNotification);
router.get("/defaults", protect, admin, getDefaultNotifications);
router.post("/send/:index", protect, admin, sendDefaultNotification);
router.get("/stored", protect, admin, getStoredNotifications);
router.post("/send/stored/:id", protect, admin, sendStoredNotification);
router.get("/admin/messages", protect, admin, getAdminMessages);

// -------------------- USER ROUTES --------------------
router.get("/my", protect, getUserNotifications);
router.post("/welcome", protect, sendWelcomeNotification);

router.put("/read/:id", protect, markNotificationRead);

router.put("/read-all", protect, markAllRead);

router.delete("/delete-all", protect, deleteAllNotifications);

router.delete("/delete/:id", protect, deleteNotification);

export default router;
