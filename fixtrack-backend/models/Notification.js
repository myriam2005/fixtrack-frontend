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
        "ticket_created",
        "ticket_assigned",
        "ticket_resolved",
        "ticket_validated",
        "ticket_critical",
        "status_changed",
        // notifie auteur + technicien quand un admin supprime un ticket
        "ticket_deleted",
      ],
      default: "status_changed",
    },
    lu: {
      type: Boolean,
      default: false,
    },
    // ticketId est nullable : le ticket peut ne plus exister (cas suppression)
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
