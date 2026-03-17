// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

// Rate limit sur les routes auth : max 5 tentatives par 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Trop de tentatives, réessayez dans 15 minutes." },
});

// POST /api/auth/register
router.post(
  "/register",
  [
    check("nom").notEmpty().withMessage("Le nom est obligatoire"),
    check("email").isEmail().withMessage("Email invalide"),
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
  authLimiter,
  [
    check("email").isEmail().withMessage("Email invalide"),
    check("password").notEmpty().withMessage("Le mot de passe est requis"),
  ],
  login,
);

// GET /api/auth/me  (route protégée)
router.get("/me", auth, getMe);

module.exports = router;
