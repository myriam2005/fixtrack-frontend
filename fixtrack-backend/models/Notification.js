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
        "ticket_assigned",
        "status_changed",
        "ticket_resolved",
        "ticket_validated",
        "ticket_critical",
        "alert",
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

module.exports = mongoose.model("Notification", notificationSchema);
