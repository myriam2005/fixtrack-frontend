// utils/createLog.js
const Log = require("../models/Log");

/**
 * createLog(action, details, userId, type, targetId, targetType)
 * Crée un log automatiquement dans la BDD
 */
const createLog = async (
  action,
  details = "",
  userId = null,
  type = "info",
  targetId = null,
  targetType = null,
) => {
  try {
    await Log.create({ action, details, userId, type, targetId, targetType });
  } catch (error) {
    // On ne veut pas que les erreurs de log bloquent le serveur
    console.error("❌ Erreur création log:", error.message);
  }
};

module.exports = createLog;
