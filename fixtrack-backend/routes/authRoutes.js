const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const dns = require("dns").promises;
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
      .isIn(["user", "technician", "manager", "admin"])
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

// POST /api/auth/verify-email
router.post(
  "/verify-email",
  [check("token").notEmpty().withMessage("Token requis")],
  verifyEmail,
);

// POST /api/auth/resend-verification
router.post(
  "/resend-verification",
  [check("email").isEmail().withMessage("Email invalide").normalizeEmail()],
  resendVerificationEmail,
);

// ✅ POST /api/auth/check-email
// Vérifie MX d'abord, fallback sur A/AAAA si pas de MX
router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.json({ valid: false, reason: "format" });
  }

  try {
    const domain = email.split("@")[1];
    if (!domain) return res.json({ valid: false, reason: "format" });

    // 1. Essai MX
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        return res.json({ valid: true, reason: null });
      }
    } catch {
      // pas de MX → fallback
    }

    // 2. Fallback : enregistrement A
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        return res.json({ valid: true, reason: null });
      }
    } catch {
      // pas de A → fallback
    }

    // 3. Fallback : enregistrement AAAA
    try {
      const aaaaRecords = await dns.resolve6(domain);
      if (aaaaRecords && aaaaRecords.length > 0) {
        return res.json({ valid: true, reason: null });
      }
    } catch {
      // rien du tout → domaine invalide
    }

    return res.json({ valid: false, reason: "domain" });
  } catch {
    return res.json({ valid: false, reason: "domain" });
  }
});

// GET /api/auth/me (protégée)
router.get("/me", auth, getMe);

module.exports = router;
