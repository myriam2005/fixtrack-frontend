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

// ✅ NEW — POST /api/auth/check-email
// Vérifie que le domaine de l'email existe (enregistrement MX)
// Utilisé par le frontend avant soumission du formulaire
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.json({ valid: false, reason: "format" });
  }
  try {
    const domain = email.split("@")[1];
    if (!domain) return res.json({ valid: false, reason: "format" });
    const records = await dns.resolveMx(domain);
    const valid = records && records.length > 0;
    return res.json({ valid, reason: valid ? null : "domain" });
  } catch {
    return res.json({ valid: false, reason: "domain" });
  }
});

// GET /api/auth/me (protégée)
router.get("/me", auth, getMe);

module.exports = router;
