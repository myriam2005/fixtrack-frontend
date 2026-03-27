// utils/sendNotification.js
const Notification = require("../models/Notification");

/**
 * Crée une notification en base.
 * @param {Object}          params
 * @param {string|ObjectId} params.userId   - Destinataire
 * @param {string}          params.message  - Texte de la notification
 * @param {string}          params.type     - Type (voir enum Notification)
 * @param {string|null}     params.ticketId - Ticket concerné (optionnel)
 * @param {Object|null}     params.meta     - Metadata libre (ex: action, reason, ticketId string…)
 */
const sendNotification = async ({
  userId,
  message,
  type = "status_changed",
  ticketId = null,
  meta = null, // ← FIX : paramètre ajouté
}) => {
  try {
    if (!userId) return;

    const resolvedUserId = userId?._id || userId;

    await Notification.create({
      userId: resolvedUserId,
      message,
      type,
      ticketId: ticketId || null,
      meta: meta || null, // ← FIX : persiste le meta en DB
    });
  } catch (error) {
    console.error("❌ Erreur création notification:", error.message);
  }
};

module.exports = sendNotification;
