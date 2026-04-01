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
// ✅ NEW: Envoie un email de vérification et empêche la connexion sans vérification
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;

    // Vérification que l'email n'existe pas déjà
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
        emailAlreadyExists: true,
      });
    }

    // Génération des initiales pour le avatar
    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Création de l'utilisateur (non vérifié par défaut)
    const user = await User.create({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "employee",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
      emailVerified: false,
    });

    // Génération du token de vérification
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoi de l'email de vérification
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      user.email,
      user.nom,
      verificationToken,
      baseUrl,
    );

    if (!emailResult.success) {
      console.warn("⚠️  Email de vérification non envoyé:", emailResult.error);
      // On peut soit renvoyer une erreur, soit créer l'utilisateur quand même
      // Pour l'UX, on va renvoyer une erreur
      await User.deleteOne({ _id: user._id }); // Nettoyer l'utilisateur
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
// ✅ NEW: Vérifie le token d'email et marque l'utilisateur comme vérifié
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token de vérification requis" });
    }

    // Cherche l'utilisateur avec ce token (hachés)
    const user = await User.findOne({
      emailVerificationToken: require("crypto")
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

    // Vérification que le token n'est pas expiré
    if (!user.verifyEmailToken(token)) {
      return res.status(400).json({
        message: "Token expiré. Veuillez en demander un nouveau.",
        tokenExpired: true,
      });
    }

    // Marquage de l'email comme vérifié
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
// ✅ NEW: Renvoie un email de vérification
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Cet email est déjà vérifié",
        alreadyVerified: true,
      });
    }

    // Vérification du rate limiting (max 3 envois par jour)
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

    // Génération du nouveau token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoi de l'email
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

    res.json({
      message: "Email de vérification renvoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur renvoi email vérification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// ✅ FIX: Vérification que l'email est validé avant de permettre la connexion
const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Cherche par email normalisé
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // ✅ NEW: Vérification que l'email est validé
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Veuillez vérifier votre email avant de vous connecter",
        emailNotVerified: true,
        userId: user._id,
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

    // Génération du token JWT
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
