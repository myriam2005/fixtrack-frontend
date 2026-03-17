// routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateStatus,
  assignTicket,
  suggestTechnician,
  addNote,
  resolveTicket,
  validateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

// POST /api/tickets  (employee, manager, admin)
router.post(
  "/",
  auth,
  roleCheck(["employee", "manager", "admin"]),
  [
    check("titre")
      .notEmpty()
      .withMessage("Le titre est obligatoire")
      .isLength({ min: 5, max: 100 })
      .withMessage("Le titre doit faire entre 5 et 100 caractères"),
    check("description")
      .notEmpty()
      .withMessage("La description est obligatoire"),
    check("categorie").notEmpty().withMessage("La catégorie est obligatoire"),
    check("localisation")
      .notEmpty()
      .withMessage("La localisation est obligatoire"),
  ],
  createTicket,
);

// GET /api/tickets
router.get("/", auth, getTickets);

// GET /api/tickets/:id
router.get("/:id", auth, getTicketById);

// PATCH /api/tickets/:id/status
router.patch("/:id/status", auth, updateStatus);

// PATCH /api/tickets/:id/assign  (manager, admin)
router.patch(
  "/:id/assign",
  auth,
  roleCheck(["manager", "admin"]),
  assignTicket,
);

// GET /api/tickets/:id/suggest-technician  (manager, admin)
router.get(
  "/:id/suggest-technician",
  auth,
  roleCheck(["manager", "admin"]),
  suggestTechnician,
);

// POST /api/tickets/:id/notes  (technician, manager, admin)
router.post(
  "/:id/notes",
  auth,
  roleCheck(["technician", "manager", "admin"]),
  addNote,
);

// PATCH /api/tickets/:id/resolve  (technician)
router.patch(
  "/:id/resolve",
  auth,
  roleCheck(["technician", "manager", "admin"]),
  resolveTicket,
);

// PATCH /api/tickets/:id/validate  (manager, admin)
router.patch(
  "/:id/validate",
  auth,
  roleCheck(["manager", "admin"]),
  validateTicket,
);

// DELETE /api/tickets/:id  (admin only)
router.delete("/:id", auth, roleCheck(["admin"]), deleteTicket);

module.exports = router;
