// routes/userRoutes.js
// IMPORTANT : /profile et /password AVANT /:id pour éviter le conflit
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getAllUsers,
  getTechnicians,
  getUserById,
  createUser, // ← nouveau
  updateUser,
  updateRole,
  deleteUser,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

// ── Routes du profil connecté (pas de rôle requis, juste auth) ───────────────
router.put("/profile", auth, updateProfile); // ← AVANT /:id
router.put("/password", auth, changePassword); // ← AVANT /:id

// ── Techniciens (manager/admin — liste pour assignation) ─────────────────────
router.get(
  "/technicians",
  auth,
  roleCheck(["manager", "admin"]),
  getTechnicians,
);

// ── CRUD admin ────────────────────────────────────────────────────────────────
// FIX : POST / → createUser (admin) au lieu de passer par /auth/register
router.get("/", auth, roleCheck(["admin", "manager"]), getAllUsers);
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
); // ← nouveau
router.get("/:id", auth, roleCheck(["admin", "manager"]), getUserById);
router.put("/:id", auth, roleCheck(["admin"]), updateUser);
router.put("/:id/role", auth, roleCheck(["admin"]), updateRole);
router.delete("/:id", auth, roleCheck(["admin"]), deleteUser);

module.exports = router;
