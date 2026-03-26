// utils/sendNotification.js
const Notification = require("../models/Notification");

/**
 * Crée une notification en base.
 * @param {Object} params
 * @param {string|ObjectId} params.userId   - Destinataire
 * @param {string}          params.message  - Texte de la notification
 * @param {string}          params.type     - Type (voir enum Notification)
 * @param {string|null}     params.ticketId - Ticket concerné (optionnel)
 */
const sendNotification = async ({
  userId,
  message,
  type = "status_changed",
  ticketId = null,
}) => {
  try {
    // ✅ Ne pas créer de notif si userId est null/undefined
    if (!userId) return;

    // ✅ Extrait l'_id si c'est un objet populé { _id, nom, ... }
    const resolvedUserId = userId?._id || userId;

    await Notification.create({
      userId: resolvedUserId,
      message,
      type,
      ticketId: ticketId || null,
    });
  } catch (error) {
    // Ne pas crasher le serveur si une notif échoue
    console.error("❌ Erreur création notification:", error.message);
  }
};

module.exports = sendNotification;
