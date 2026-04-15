// routes/userRoutes.js
// IMPORTANT : /profile et /password AVANT /:id pour éviter les conflits de routes

const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getAllUsers,
  getTechnicians,
  getUserById,
  createUser,
  updateUser,
  updateRole,
  deleteUser,
  deletePendingUser,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

// ── Profil connecté (auth seulement) ─────────────────────────────────────────
router.put("/profile", auth, updateProfile); // DOIT être AVANT /:id
router.put("/password", auth, changePassword); // DOIT être AVANT /:id

// ── Techniciens ───────────────────────────────────────────────────────────────
router.get(
  "/technicians",
  auth,
  roleCheck(["manager", "admin"]),
  getTechnicians,
);

// ── CRUD admin ────────────────────────────────────────────────────────────────
router.get("/", auth, roleCheck(["admin", "manager"]), getAllUsers);

// POST / → crée un PendingUser (pas un User)
router.post(
  "/",
  auth,
  roleCheck(["admin"]),
  [
    check("nom").notEmpty().withMessage("Le nom est obligatoire"),
    check("email").isEmail().withMessage("Email invalide").normalizeEmail(),
    check("password").isLength({ min: 6 }).withMessage("Minimum 6 caractères"),
    check("role")
      .optional()
      .isIn(["user", "technician", "manager", "admin"])
      .withMessage("Rôle invalide"),
  ],
  createUser,
);

router.get("/:id", auth, roleCheck(["admin", "manager"]), getUserById);
router.put("/:id", auth, roleCheck(["admin"]), updateUser);
router.put("/:id/role", auth, roleCheck(["admin"]), updateRole);

// DELETE /:id → supprime User OU PendingUser (détection automatique)
router.delete("/:id", auth, roleCheck(["admin"]), deleteUser);

module.exports = router;
