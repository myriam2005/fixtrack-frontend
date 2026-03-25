// utils/createLog.js
const Log = require("../models/Log");

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
    console.error("❌ Erreur création log:", error.message);
  }
};

module.exports = createLog;
