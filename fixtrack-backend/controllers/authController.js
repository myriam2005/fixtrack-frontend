// controllers/authController.js
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const createLog = require("../utils/createLog");
const { sendVerificationEmail } = require("../utils/emailService");

// ── Generate JWT Token ────────────────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Inscription publique : envoie un email de vérification, bloque la connexion tant que non vérifié
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Vérification unicité
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
        emailAlreadyExists: true,
      });
    }

    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Création du compte (emailVerified: false par défaut)
    const user = await User.create({
      nom: nom.trim(),
      email: normalizedEmail,
      password,
      role: role || "user",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
      emailVerified: false,
    });

    // Token de vérification
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      user.email,
      user.nom,
      verificationToken,
      baseUrl,
    );

    if (!emailResult.success) {
      console.warn("⚠️  Email de vérification non envoyé:", emailResult.error);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({
        message:
          "Impossible d'envoyer l'email de vérification. Veuillez réessayer.",
        emailSendError: true,
      });
    }

    await createLog(
      "REGISTER",
      `Nouveau compte créé : ${user.email} (en attente de vérification)`,
      user._id,
    );

    res.status(201).json({
      message: "Inscription réussie! Un email de vérification a été envoyé.",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: false,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("Erreur registration:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token de vérification requis" });
    }

    const crypto = require("crypto");
    const user = await User.findOne({
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(token)
        .digest("hex"),
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalide ou expiré",
        tokenInvalid: true,
      });
    }

    if (!user.verifyEmailToken(token)) {
      return res.status(400).json({
        message: "Token expiré. Veuillez en demander un nouveau.",
        tokenExpired: true,
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();

    await createLog(
      "EMAIL_VERIFIED",
      `Email vérifié : ${user.email}`,
      user._id,
    );

    res.json({
      message: "Email vérifié avec succès!",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/resend-verification ────────────────────────────────────────
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Cet email est déjà vérifié",
        alreadyVerified: true,
      });
    }

    // Rate limiting : 5 min entre deux envois
    if (user.emailVerificationSentAt) {
      const timeSinceLastSend =
        Date.now() - user.emailVerificationSentAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceLastSend < fiveMinutes) {
        return res.status(429).json({
          message: "Veuillez attendre 5 minutes avant de renvoyer l'email",
          rateLimited: true,
        });
      }
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      user.email,
      user.nom,
      verificationToken,
      baseUrl,
    );

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Impossible d'envoyer l'email de vérification",
      });
    }

    res.json({ message: "Email de vérification renvoyé avec succès" });
  } catch (error) {
    console.error("Erreur renvoi email vérification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// ✅ Bloque la connexion si emailVerified === false (comptes admin-créés inclus)
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // ✅ Vérification email obligatoire — s'applique aux comptes auto-inscrits ET admin-créés
    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte mail.",
        emailNotVerified: true,
        requiresEmailVerification: true,
      });
    }

    if (!user.actif) {
      return res
        .status(401)
        .json({ message: "Compte désactivé — contactez l'administrateur" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const token = generateToken(user._id, user.role);
    await createLog("LOGIN", `Connexion de ${user.email}`, user._id);

    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        competences: user.competences,
        telephone: user.telephone,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (!user.actif) {
      return res.status(401).json({ message: "Compte désactivé" });
    }
    res.json({
      id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      competences: user.competences,
      telephone: user.telephone,
      actif: user.actif,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Erreur getMe:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
};
