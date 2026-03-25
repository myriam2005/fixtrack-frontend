// routes/logsRoutes.js
const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logsController");
const auth = require("../middleware/auth");

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé — admin uniquement" });
  }
  next();
};

router.get("/", auth, adminOnly, getLogs);

module.exports = router;
