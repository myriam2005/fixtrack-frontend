// controllers/logsController.js
const Log = require("../models/Log");

/**
 * GET /api/logs
 * Retourne les logs triés par date décroissante
 * Populate userId pour avoir le nom de l'acteur
 */
const getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logs = await Log.find()
      .populate("userId", "nom email role") // résout userId → { nom, email, role }
      .sort({ createdAt: -1 }) // plus récents en premier
      .limit(limit)
      .lean(); // retourne des objets JS purs (plus rapide)

    res.json(logs);
  } catch (error) {
    console.error("❌ getLogs error:", error.message);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des logs." });
  }
};

module.exports = { getLogs };
