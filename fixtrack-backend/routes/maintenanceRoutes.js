// routes/maintenanceRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const MaintenanceSchedule = require("../models/MaintenanceSchedule");

// POST /api/maintenance
router.post("/", auth, roleCheck(["manager", "admin"]), async (req, res) => {
  try {
    const schedule = await new MaintenanceSchedule(req.body).save();
    const populated = await MaintenanceSchedule.findById(schedule._id)
      .populate("machineId", "nom localisation")
      .populate("technicienId", "nom avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/maintenance
router.get("/", auth, async (req, res) => {
  try {
    // Retourne le planning du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const schedules = await MaintenanceSchedule.find({
      datePrevisionnelle: { $gte: startOfMonth, $lt: endOfMonth },
    })
      .populate("machineId", "nom localisation categorie")
      .populate("technicienId", "nom avatar competences")
      .sort({ datePrevisionnelle: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/maintenance/:id
router.patch(
  "/:id",
  auth,
  roleCheck(["manager", "admin", "technician"]),
  async (req, res) => {
    try {
      const schedule = await MaintenanceSchedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      )
        .populate("machineId", "nom localisation")
        .populate("technicienId", "nom avatar");

      if (!schedule)
        return res.status(404).json({ message: "Planning non trouvé" });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// DELETE /api/maintenance/:id
router.delete(
  "/:id",
  auth,
  roleCheck(["manager", "admin"]),
  async (req, res) => {
    try {
      await MaintenanceSchedule.findByIdAndDelete(req.params.id);
      res.json({ message: "Planning supprimé" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
