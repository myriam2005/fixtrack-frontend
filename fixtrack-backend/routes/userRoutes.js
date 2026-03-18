// routes/userRoutes.js
// IMPORTANT : /profile et /password AVANT /:id pour éviter le conflit
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getAllUsers,
  getTechnicians,
  getUserById,
  updateUser,
  updateRole,
  deleteUser,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

// ── Routes du profil connecté (pas de rôle requis, juste auth) ───────────────
router.put("/profile", auth, updateProfile); // ← AVANT /:id
router.put("/password", auth, changePassword); // ← AVANT /:id

// ── Routes publiques (pour la liste des techniciens — manager/admin) ─────────
router.get(
  "/technicians",
  auth,
  roleCheck(["manager", "admin"]),
  getTechnicians,
);

// ── Routes admin ─────────────────────────────────────────────────────────────
router.get("/", auth, roleCheck(["admin"]), getAllUsers);
router.get("/:id", auth, roleCheck(["admin", "manager"]), getUserById);
router.put("/:id", auth, roleCheck(["admin"]), updateUser);
router.put("/:id/role", auth, roleCheck(["admin"]), updateRole);
router.delete("/:id", auth, roleCheck(["admin"]), deleteUser);

module.exports = router;
