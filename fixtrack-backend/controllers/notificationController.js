// controllers/notificationController.js
const Notification = require("../models/Notification");

// ── GET /api/notifications ────────────────────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate("ticketId", "titre statut priorite")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { lu: true },
      { new: true },
    );
    if (!notif)
      return res.status(404).json({ message: "Notification non trouvée" });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, lu: false },
      { lu: true },
    );
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/notifications/unread-count ──────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      lu: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
