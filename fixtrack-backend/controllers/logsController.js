// controllers/logsController.js
const Log = require("../models/Log");
const createLog = require("../utils/createLog");

// ── GET /api/logs ─────────────────────────────────────────────────────────────
const getLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const type = req.query.type; // "info" | "warning" | "error"
    const action = req.query.action; // "TICKET_CREATED" etc.
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.type = type;
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .populate("userId", "nom email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Log.countDocuments(filter),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("❌ getLogs error:", err.message);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── DELETE /api/logs (admin — purge) ──────────────────────────────────────────
const deleteLogs = async (req, res) => {
  try {
    const { before } = req.query; // date ISO optionnelle
    const filter = before ? { createdAt: { $lt: new Date(before) } } : {};
    const result = await Log.deleteMany(filter);

    await createLog(
      "LOGS_PURGED",
      `${result.deletedCount} log(s) supprimé(s)`,
      req.user.id,
      "warning",
    );

    res.json({ message: `${result.deletedCount} log(s) supprimé(s)` });
  } catch (err) {
    console.error("❌ deleteLogs error:", err.message);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

module.exports = { getLogs, deleteLogs };
