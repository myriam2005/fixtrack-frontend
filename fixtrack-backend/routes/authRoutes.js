// routes/authRoutes.js
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

// ── POST /api/auth/check-email ────────────────────────────────────────────────
// Vérifie que le domaine email existe réellement (utilisé par le frontend avant soumission)
// Logique : domaines connus → valide direct | DNS MX → valide | DNS A/AAAA → valide | rien → invalide
// En cas d'erreur réseau globale → fail open (on laisse passer)
router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.json({ valid: false, reason: "format" });
  }

  try {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || domain.length < 3) {
      return res.json({ valid: false, reason: "format" });
    }

    const KNOWN_DOMAINS = new Set([
      "gmail.com",
      "googlemail.com",
      "yahoo.com",
      "yahoo.fr",
      "yahoo.co.uk",
      "hotmail.com",
      "hotmail.fr",
      "outlook.com",
      "outlook.fr",
      "live.com",
      "live.fr",
      "icloud.com",
      "me.com",
      "mac.com",
      "protonmail.com",
      "proton.me",
      "tutanota.com",
      "tutanota.de",
      "gmx.com",
      "gmx.net",
      "gmx.fr",
      "mail.com",
      "fst.tn",
      "fixtrack.app",
      "fixtrack.local",
    ]);

    if (KNOWN_DOMAINS.has(domain)) {
      return res.json({ valid: true, reason: null });
    }

    // MX
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0)
        return res.json({ valid: true, reason: null });
    } catch {}

    // A
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0)
        return res.json({ valid: true, reason: null });
    } catch {}

    // AAAA
    try {
      const aaaaRecords = await dns.resolve6(domain);
      if (aaaaRecords && aaaaRecords.length > 0)
        return res.json({ valid: true, reason: null });
    } catch {}

    return res.json({ valid: false, reason: "domain" });
  } catch (err) {
    console.warn(
      "[check-email] Erreur DNS inattendue, fail open:",
      err.message,
    );
    return res.json({ valid: true, reason: "dns_unavailable" });
  }
});

// GET /api/auth/me (protégée)
router.get("/me", auth, getMe);

module.exports = router;
