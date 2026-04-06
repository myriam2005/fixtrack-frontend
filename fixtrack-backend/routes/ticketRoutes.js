// routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateStatus,
  assignTicket,
  suggestTechnician,
  addNote,
  resolveTicket,
  validateTicket,
  refuseTicket,
} = require("../controllers/ticketController");

// ── Lecture ───────────────────────────────────────────────────────────────────
router.get(
  "/",
  auth,
  roleCheck(["user", "technician", "manager", "admin"]),
  getAllTickets,
);

router.get(
  "/:id",
  auth,
  roleCheck(["user", "technician", "manager", "admin"]),
  getTicketById,
);

// ── Suggestion technicien (avant /:id/assign pour éviter conflit) ─────────────
router.get(
  "/:id/suggest-technician",
  auth,
  roleCheck(["manager", "admin"]),
  suggestTechnician,
);

// ── Création ──────────────────────────────────────────────────────────────────
router.post("/", auth, roleCheck(["user", "manager", "admin"]), createTicket);

// ── Modification complète (admin) ─────────────────────────────────────────────
router.put("/:id", auth, roleCheck(["admin"]), updateTicket);

// ── Suppression (admin) ───────────────────────────────────────────────────────
router.delete("/:id", auth, roleCheck(["admin"]), deleteTicket);

// ── Changement de statut ──────────────────────────────────────────────────────
router.patch(
  "/:id/status",
  auth,
  roleCheck(["technician", "manager", "admin"]),
  updateStatus,
);

// ── Assignation (manager/admin) ───────────────────────────────────────────────
router.patch(
  "/:id/assign",
  auth,
  roleCheck(["manager", "admin"]),
  assignTicket,
);
router.patch("/:id/refuse", auth, roleCheck(["technician"]), refuseTicket);
// ── Notes techniques (technicien) ────────────────────────────────────────────
router.post(
  "/:id/notes",
  auth,
  roleCheck(["technician", "manager", "admin"]),
  addNote,
);

// ── Résoudre (technicien) ─────────────────────────────────────────────────────
router.patch("/:id/resolve", auth, roleCheck(["technician"]), resolveTicket);

// ── Valider / clôturer (manager/admin) ───────────────────────────────────────
router.patch(
  "/:id/validate",
  auth,
  roleCheck(["manager", "admin"]),
  validateTicket,
);

module.exports = router;
