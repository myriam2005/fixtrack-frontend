// routes/userRoutes.js
// IMPORTANT : /profile et /password AVANT /:id pour éviter le conflit de routes
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
  updateProfile,
  changePassword,
} = require("../controllers/userController");

// ── Routes du profil connecté (auth seulement, pas de rôle requis) ───────────
router.put("/profile", auth, updateProfile); // ← DOIT être AVANT /:id
router.put("/password", auth, changePassword); // ← DOIT être AVANT /:id

// ── Techniciens (manager/admin — liste pour assignation tickets) ──────────────
router.get(
  "/technicians",
  auth,
  roleCheck(["manager", "admin"]),
  getTechnicians,
);

// ── CRUD admin ────────────────────────────────────────────────────────────────
router.get("/", auth, roleCheck(["admin", "manager"]), getAllUsers);

// POST / → createUser (admin crée un compte)
// Vérifie domaine email + envoie email de vérification → compte inaccessible tant que non vérifié
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

// PUT /:id → updateUser (admin modifie un compte)
// Si email change : vérification DNS + re-vérification par email
router.put("/:id", auth, roleCheck(["admin"]), updateUser);

router.put("/:id/role", auth, roleCheck(["admin"]), updateRole);
router.delete("/:id", auth, roleCheck(["admin"]), deleteUser);

module.exports = router;
