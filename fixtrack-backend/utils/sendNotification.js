// utils/sendNotification.js
const Notification = require("../models/Notification");

const sendNotification = async ({
  userId,
  message,
  type = "status_changed",
  ticketId = null,
}) => {
  try {
    await Notification.create({ userId, message, type, ticketId });
  } catch (error) {
    console.error("❌ Erreur création notification:", error.message);
  }
};

module.exports = sendNotification;
