// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ticket_created", // ✅ ajout — notif managers à la création
        "ticket_assigned",
        "ticket_critical", // ✅ ajout — ticket priorité critique
        "status_changed",
        "ticket_resolved",
        "ticket_validated",
        "alert",
        "note_added", // ✅ ajout — note ajoutée sur un ticket
      ],
      default: "status_changed",
    },
    lu: {
      type: Boolean,
      default: false,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
  },
  { timestamps: true },
);

// Index pour charger rapidement les notifs d'un user
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, lu: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
