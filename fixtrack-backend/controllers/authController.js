// controllers/authController.js
// REFACTORISÉ :
//    - register      → crée un PendingUser (pas un User)
//    - verifyEmail   → migre PendingUser → User PUIS supprime le PendingUser
//    - login         → inchangé (cherche dans User seulement)

const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const createLog = require("../utils/createLog");
const { sendVerificationEmail } = require("../utils/emailService");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Auto-inscription : crée un PendingUser, envoie email, RIEN dans User tant que non validé.
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ── Unicité dans User ET PendingUser ──────────────────────────────────────
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
//  cherche dans PendingUser, crée le vrai User, supprime le PendingUser.
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token de vérification requis" });
    }

    // Cherche le PendingUser dont le token hashé correspond
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const pending = await PendingUser.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!pending) {
      // Peut-être déjà validé ? Vérifie dans User
      const alreadyVerified = await User.findOne({
        email: { $exists: true },
        emailVerified: true,
      });
      return res.status(400).json({
        message: "Token invalide ou déjà utilisé.",
        tokenInvalid: true,
      });
    }

    // Vérifie expiration
    if (!pending.isTokenValid(token)) {
      return res.status(400).json({
        message: "Le lien de vérification a expiré. Demandez un nouveau lien.",
        tokenExpired: true,
      });
    }

    // ── Vérification de dernière chance : l'email n'a pas été pris entre-temps
    const conflict = await User.findOne({ email: pending.email });
    if (conflict) {
      // Nettoyage du PendingUser orphelin
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà.",
        emailAlreadyExists: true,
      });
    }

    // ── Migration PendingUser → User ──────────────────────────────────────────
    // Le mot de passe est DÉJÀ hashé dans PendingUser (pre-save hook).
    // On bypasse le hook de hachage de User en utilisant insertOne direct.
    const newUserData = {
      nom: pending.nom,
      email: pending.email,
      password: pending.password, // déjà hashé
      role: pending.role,
      avatar: pending.avatar,
      telephone: pending.telephone,
      competences: pending.competences,
      actif: true,
      emailVerified: true, // ← compte immédiatement utilisable
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
      emailVerificationSentAt: null,
    };

    // Utilise insertOne pour ne pas déclencher le pre-save qui re-hasherait le mdp
    const result = await User.collection.insertOne({
      ...newUserData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUserId = result.insertedId;

    // Supprime le PendingUser maintenant que le User existe
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

    // Vérifie si déjà un vrai compte
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        message: "Cet email est déjà vérifié. Vous pouvez vous connecter.",
        alreadyVerified: true,
      });
    }

    // Cherche dans PendingUser
    const pending = await PendingUser.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(404).json({
        message: "Aucun compte en attente pour cet email.",
      });
    }

    // Rate limiting : 5 min entre deux envois
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
// Inchangé — cherche uniquement dans User (les PendingUsers ne peuvent pas se connecter)
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Vérifie si l'email est en attente de vérification pour donner un message clair
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

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
};
