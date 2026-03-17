// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../controllers/notificationController");

// GET /api/notifications
router.get("/", auth, getMyNotifications);

// GET /api/notifications/unread-count
router.get("/unread-count", auth, getUnreadCount);

// PATCH /api/notifications/read-all
router.patch("/read-all", auth, markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", auth, markAsRead);

module.exports = router;
