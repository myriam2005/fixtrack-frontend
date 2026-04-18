// controllers/userController.js
//  createUser crée un PendingUser (pas un vrai User).
//    Le User réel est créé UNIQUEMENT à la validation email (voir authController.verifyEmail).

const { validationResult } = require("express-validator");
const dns = require("dns").promises;
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const createLog = require("../utils/createLog");
const { sendVerificationEmail } = require("../utils/emailService");

// ── Helper: vérification DNS du domaine email ─────────────────────────────────
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

async function isEmailDomainValid(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || domain.length < 3) return false;
  if (KNOWN_DOMAINS.has(domain)) return true;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx?.length > 0) return true;
  } catch {}
  try {
    const a = await dns.resolve4(domain);
    if (a?.length > 0) return true;
  } catch {}
  try {
    const aa = await dns.resolve6(domain);
    if (aa?.length > 0) return true;
  } catch {}
  return false;
}

// ── GET /api/users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    // Retourne les vrais Users + les PendingUsers pour que l'admin voit l'état complet
    const [users, pending] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      PendingUser.find()
        .select("-password -emailVerificationToken")
        .sort({ createdAt: -1 }),
    ]);

    // Ajoute un marqueur visuel pour les comptes en attente
    const pendingFormatted = pending.map((p) => ({
      _id: p._id,
      nom: p.nom,
      email: p.email,
      role: p.role,
      avatar: p.avatar,
      telephone: p.telephone,
      competences: p.competences,
      actif: false,
      emailVerified: false,
      isPending: true, // ← marqueur côté frontend
      createdAt: p.createdAt,
      expiresAt: p.emailVerificationTokenExpires,
    }));

    res.json([...users, ...pendingFormatted]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── GET /api/users/technicians ────────────────────────────────────────────────
const getTechnicians = async (req, res) => {
  try {
    // Uniquement les vrais techniciens actifs et vérifiés
    const technicians = await User.find({ role: "technician", actif: true })
      .select("-password")
      .sort({ nom: 1 });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    // Cherche d'abord dans User, puis dans PendingUser
    const user = await User.findById(req.params.id).select("-password");
    if (user) return res.json(user);

    const pending = await PendingUser.findById(req.params.id).select(
      "-password -emailVerificationToken",
    );
    if (pending) return res.json({ ...pending.toJSON(), isPending: true });

    res.status(404).json({ message: "Utilisateur non trouvé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/users (admin crée un compte) ────────────────────────────────────
//    1. Vérifie domaine DNS
//    2. Crée un PendingUser (PAS un User)
//    3. Envoie l'email de vérification
//    4. Le User réel sera créé dans authController.verifyEmail au clic du lien
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ── 1. Unicité — vérifie dans User ET PendingUser ─────────────────────────
    const [existingUser, existingPending] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      PendingUser.findOne({ email: normalizedEmail }),
    ]);

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé par un compte actif.",
        emailAlreadyExists: true,
      });
    }
    if (existingPending) {
      return res.status(400).json({
        message:
          "Un compte en attente de vérification existe déjà pour cet email. L'utilisateur doit valider son email.",
        emailPendingVerification: true,
      });
    }

    // ── 2. Validation DNS du domaine ──────────────────────────────────────────
    let domainValid = true;
    try {
      domainValid = await isEmailDomainValid(normalizedEmail);
    } catch {
      console.warn("[createUser] DNS check failed, fail open");
    }

    if (!domainValid) {
      return res.status(400).json({
        message: "Le domaine de cet email n'existe pas. Aucun compte créé.",
        emailDomainInvalid: true,
      });
    }

    // ── 3. Création du PendingUser ────────────────────────────────────────────
    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const pending = new PendingUser({
      nom: nom.trim(),
      email: normalizedEmail,
      password, // hashé par le pre-save hook
      role: role || "user",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
      createdByAdmin: true,
    });

    // ── 4. Génère le token et sauvegarde ──────────────────────────────────────
    const rawToken = pending.generateVerificationToken();
    await pending.save();

    // ── 5. Envoi de l'email de vérification ───────────────────────────────────
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      pending.email,
      pending.nom,
      rawToken,
      baseUrl,
    );

    if (!emailResult.success) {
      // Rollback : supprimer le PendingUser si l'email échoue
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(500).json({
        message:
          "Impossible d'envoyer l'email de vérification. Aucun compte créé.",
        emailSendError: true,
      });
    }

    await createLog(
      "ADMIN_CREATE_PENDING_USER",
      `Compte en attente créé pour : ${pending.email} (rôle: ${pending.role}) — en attente de validation email`,
      req.user.id,
    );

    res.status(201).json({
      message:
        "Compte en attente créé. Un email de vérification a été envoyé. Le compte sera actif uniquement après validation.",
      user: {
        id: pending._id,
        nom: pending.nom,
        email: pending.email,
        role: pending.role,
        avatar: pending.avatar,
        isPending: true,
        emailVerified: false,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("Erreur createUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/:id (admin modifie un compte actif) ───────────────────────
// Note : on ne modifie QUE les vrais Users (pas les PendingUsers)
const updateUser = async (req, res) => {
  try {
    const { nom, email, password, role, telephone, competences, actif } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      // Vérifie si c'est un PendingUser
      const pending = await PendingUser.findById(req.params.id);
      if (pending) {
        return res.status(400).json({
          message:
            "Ce compte est en attente de vérification email. Il ne peut pas encore être modifié.",
          isPending: true,
        });
      }
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let emailChanged = false;

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const [existing, existingPending] = await Promise.all([
        User.findOne({ email: normalizedEmail, _id: { $ne: user._id } }),
        PendingUser.findOne({ email: normalizedEmail }),
      ]);
      if (existing || existingPending) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé.",
          emailAlreadyExists: true,
        });
      }
      let domainValid = true;
      try {
        domainValid = await isEmailDomainValid(normalizedEmail);
      } catch {}
      if (!domainValid) {
        return res.status(400).json({
          message: "Le domaine du nouvel email n'existe pas.",
          emailDomainInvalid: true,
        });
      }
      user.email = normalizedEmail;
      user.emailVerified = false;
      emailChanged = true;
    }

    if (nom !== undefined) user.nom = nom.trim();
    if (role !== undefined) user.role = role;
    if (telephone !== undefined) user.telephone = telephone || null;
    if (competences !== undefined) user.competences = competences;
    if (actif !== undefined) user.actif = actif;
    if (password && password.trim().length >= 6) user.password = password;

    await user.save();

    if (emailChanged) {
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      await sendVerificationEmail(
        user.email,
        user.nom,
        verificationToken,
        baseUrl,
      );
    }

    await createLog(
      "ADMIN_UPDATE_USER",
      `Compte modifié : ${user.email}${emailChanged ? " (re-vérification email requise)" : ""}`,
      req.user.id,
    );

    res.json({
      message: emailChanged
        ? "Compte mis à jour. Un email de vérification a été envoyé."
        : "Compte mis à jour avec succès",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        actif: user.actif,
        emailVerified: user.emailVerified,
        telephone: user.telephone,
        competences: user.competences,
      },
      emailChanged,
    });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/:id/role ────────────────────────────────────────────────────
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["user", "technician", "manager", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" },
    );
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    await createLog(
      "UPDATE_ROLE",
      `Rôle de ${user.email} → ${role}`,
      req.user.id,
    );
    res.json({ message: "Rôle mis à jour", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
// Supprime un vrai User OU un PendingUser (compte en attente)
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    // Tente de supprimer dans User d'abord
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      await createLog(
        "DELETE_USER",
        `Compte supprimé : ${user.email}`,
        req.user.id,
      );
      return res.json({ message: "Utilisateur supprimé avec succès" });
    }

    // Sinon dans PendingUser
    const pending = await PendingUser.findByIdAndDelete(req.params.id);
    if (pending) {
      await createLog(
        "DELETE_PENDING_USER",
        `Compte en attente supprimé : ${pending.email}`,
        req.user.id,
      );
      return res.json({ message: "Compte en attente supprimé" });
    }

    res.status(404).json({ message: "Utilisateur non trouvé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── DELETE /api/users/pending/:id ─────────────────────────────────────────────
// Route dédiée pour annuler un compte en attente (admin)
const deletePendingUser = async (req, res) => {
  try {
    const pending = await PendingUser.findByIdAndDelete(req.params.id);
    if (!pending)
      return res.status(404).json({ message: "Compte en attente introuvable" });
    await createLog(
      "DELETE_PENDING_USER",
      `Compte en attente annulé : ${pending.email}`,
      req.user.id,
    );
    res.json({ message: "Compte en attente supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { nom, telephone, competences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (nom !== undefined) user.nom = nom.trim();
    if (telephone !== undefined) user.telephone = telephone || null;
    if (competences !== undefined) user.competences = competences;
    await user.save();
    await createLog(
      "UPDATE_PROFILE",
      `Profil mis à jour : ${user.email}`,
      user._id,
    );
    res.json({
      message: "Profil mis à jour",
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
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/password ───────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Les deux mots de passe sont requis" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Minimum 6 caractères" });
    }
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    user.password = newPassword;
    await user.save();
    await createLog(
      "CHANGE_PASSWORD",
      `Mot de passe changé : ${user.email}`,
      user._id,
    );
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getTechnicians,
  getUserById,
  createUser,
  updateUser,
  updateRole,
  deleteUser,
  deletePendingUser,
  updateProfile,
  changePassword,
};
