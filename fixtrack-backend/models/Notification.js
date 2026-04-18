// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "ticket_created",
        "ticket_assigned",
        "ticket_resolved",
        "ticket_validated",
        "ticket_critical",
        "ticket_deleted",
        "status_changed",
        "ticket_refused", // technicien a refusé le ticket
        "profile_updated", //  admin a modifié le profil
      ],
      default: "status_changed",
    },
    lu: { type: Boolean, default: false },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
    // ✅ NOUVEAU — metadata pour le bouton quick-assign côté manager
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
