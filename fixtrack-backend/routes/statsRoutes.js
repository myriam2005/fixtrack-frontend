// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getManagerStats,
  getAdminStats,
  getTechnicianStats,
} = require("../controllers/statsController");

// GET /api/stats/manager
router.get("/manager", auth, roleCheck(["manager", "admin"]), getManagerStats);

// GET /api/stats/admin
router.get("/admin", auth, roleCheck(["admin"]), getAdminStats);

// GET /api/stats/technician/:id
router.get(
  "/technician/:id",
  auth,
  roleCheck(["technician", "manager", "admin"]),
  getTechnicianStats,
);

module.exports = router;
