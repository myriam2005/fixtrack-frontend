// controllers/authController.js
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const createLog = require("../utils/createLog");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [existingUser, existingPending] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      PendingUser.findOne({ email: normalizedEmail }),
    ]);

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
        emailAlreadyExists: true,
      });
    }
    if (existingPending) {
      return res.status(400).json({
        message:
          "Un email de vérification a déjà été envoyé à cette adresse. Veuillez vérifier votre boîte mail.",
        emailPendingVerification: true,
      });
    }

    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const pending = new PendingUser({
      nom: nom.trim(),
      email: normalizedEmail,
      password,
      role: role || "user",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
      createdByAdmin: false,
    });

    const rawToken = pending.generateVerificationToken();
    await pending.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      pending.email,
      pending.nom,
      rawToken,
      baseUrl,
    );

    if (!emailResult.success) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(500).json({
        message:
          "Impossible d'envoyer l'email de vérification. Veuillez réessayer.",
        emailSendError: true,
      });
    }

    await createLog(
      "REGISTER_PENDING",
      `Inscription en attente : ${pending.email}`,
      pending._id,
    );

    res.status(201).json({
      message:
        "Inscription enregistrée. Vérifiez votre email pour activer votre compte.",
      user: {
        id: pending._id,
        nom: pending.nom,
        email: pending.email,
        role: pending.role,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("Erreur register:", error);
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const pending = await PendingUser.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!pending) {
      return res.status(400).json({
        message: "Token invalide ou déjà utilisé.",
        tokenInvalid: true,
      });
    }

    if (!pending.isTokenValid(token)) {
      return res.status(400).json({
        message: "Le lien de vérification a expiré. Demandez un nouveau lien.",
        tokenExpired: true,
      });
    }

    const conflict = await User.findOne({ email: pending.email });
    if (conflict) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà.",
        emailAlreadyExists: true,
      });
    }

    const newUserData = {
      nom: pending.nom,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      avatar: pending.avatar,
      telephone: pending.telephone,
      competences: pending.competences,
      actif: true,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
      emailVerificationSentAt: null,
    };

    const result = await User.collection.insertOne({
      ...newUserData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUserId = result.insertedId;

    await PendingUser.deleteOne({ _id: pending._id });

    await createLog(
      "EMAIL_VERIFIED",
      `Compte activé : ${pending.email} (rôle: ${pending.role})`,
      newUserId,
    );

    res.json({
      message: "Email vérifié avec succès ! Votre compte est maintenant actif.",
      user: {
        id: newUserId,
        nom: pending.nom,
        email: pending.email,
        role: pending.role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Erreur verifyEmail:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/resend-verification ────────────────────────────────────────
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        message: "Cet email est déjà vérifié. Vous pouvez vous connecter.",
        alreadyVerified: true,
      });
    }

    const pending = await PendingUser.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(404).json({
        message: "Aucun compte en attente pour cet email.",
      });
    }

    if (pending.emailVerificationSentAt) {
      const elapsed = Date.now() - pending.emailVerificationSentAt.getTime();
      if (elapsed < 5 * 60 * 1000) {
        return res.status(429).json({
          message: "Attendez 5 minutes avant de renvoyer l'email.",
          rateLimited: true,
        });
      }
    }

    const rawToken = pending.generateVerificationToken();
    await pending.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      pending.email,
      pending.nom,
      rawToken,
      baseUrl,
    );

    if (!emailResult.success) {
      return res.status(500).json({ message: "Impossible d'envoyer l'email." });
    }

    res.json({ message: "Email de vérification renvoyé avec succès." });
  } catch (error) {
    console.error("Erreur resendVerification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      const pending = await PendingUser.findOne({
        email: email.toLowerCase().trim(),
      });
      if (pending) {
        return res.status(403).json({
          message:
            "Votre compte est en attente de validation. Vérifiez votre email et cliquez sur le lien de confirmation.",
          emailNotVerified: true,
          requiresEmailVerification: true,
        });
      }
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Veuillez vérifier votre adresse email avant de vous connecter.",
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
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (!user.actif)
      return res.status(401).json({ message: "Compte désactivé" });
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

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // On cherche l'utilisateur silencieusement (anti-énumération)
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.actif) {
      // Générer un token brut sécurisé
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Stocker uniquement le hash en base
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 heure
      await user.save();

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(user.email, user.nom, resetLink);

      await createLog(
        "FORGOT_PASSWORD",
        `Demande de reset password pour : ${user.email}`,
        user._id,
      );

      console.log(`🔑 Reset password demandé pour : ${user.email}`);
    }

    // Réponse identique que l'utilisateur existe ou non (sécurité)
    return res.json({
      success: true,
      message:
        "Si ce compte existe, un email de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Erreur forgotPassword:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: "Données invalides." });
    }

    // Hasher le token reçu pour comparer avec celui en base
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }, // pas expiré
    });

    if (!user) {
      return res.status(400).json({
        message: "Lien invalide ou expiré. Veuillez refaire une demande.",
        tokenInvalid: true,
      });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    await createLog(
      "RESET_PASSWORD",
      `Mot de passe réinitialisé pour : ${user.email}`,
      user._id,
    );

    console.log(`✅ Mot de passe réinitialisé pour : ${user.email}`);

    return res.json({
      success: true,
      message: "Mot de passe mis à jour avec succès.",
    });
  } catch (error) {
    console.error("Erreur resetPassword:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
