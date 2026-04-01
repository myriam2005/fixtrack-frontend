// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

// POST /api/auth/register
router.post(
  "/register",
  [
    check("nom").notEmpty().withMessage("Le nom est obligatoire"),
    check("email").isEmail().withMessage("Email invalide").normalizeEmail(),
    check("password").isLength({ min: 6 }).withMessage("Minimum 6 caractères"),
    check("role")
      .optional()
      .isIn(["employee", "technician", "manager", "admin"])
      .withMessage("Rôle invalide"),
  ],
  register,
);

// POST /api/auth/login
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Email invalide"),
    check("password").notEmpty().withMessage("Le mot de passe est requis"),
  ],
  login,
);

// ── NEW: POST /api/auth/verify-email
// Vérifie le token d'email
router.post(
  "/verify-email",
  [check("token").notEmpty().withMessage("Token requis")],
  verifyEmail,
);

// ── NEW: POST /api/auth/resend-verification
// Renvoie un email de vérification
router.post(
  "/resend-verification",
  [check("email").isEmail().withMessage("Email invalide").normalizeEmail()],
  resendVerificationEmail,
);

// GET /api/auth/me (route protégée)
router.get("/me", auth, getMe);

module.exports = router;
