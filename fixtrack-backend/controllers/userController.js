// controllers/userController.js
const { validationResult } = require("express-validator");
const dns = require("dns").promises;
const User = require("../models/User");
const createLog = require("../utils/createLog");
const { sendVerificationEmail } = require("../utils/emailService");

// ── Helper: vérification DNS du domaine email ─────────────────────────────────
// Retourne true si le domaine est valide, false sinon
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

  // MX
  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) return true;
  } catch {}

  // A
  try {
    const a = await dns.resolve4(domain);
    if (a && a.length > 0) return true;
  } catch {}

  // AAAA
  try {
    const aaaa = await dns.resolve6(domain);
    if (aaaa && aaaa.length > 0) return true;
  } catch {}

  return false;
}

// ── GET /api/users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── GET /api/users/technicians ────────────────────────────────────────────────
const getTechnicians = async (req, res) => {
  try {
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
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── POST /api/users (admin crée un compte) ────────────────────────────────────
// ✅ Vérifie le domaine email, crée le compte non vérifié, envoie un email de vérification.
// Le compte ne peut PAS être utilisé avant que l'utilisateur clique sur le lien.
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // ── 1. Vérification unicité email ─────────────────────────────────────────
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
        emailAlreadyExists: true,
      });
    }

    // ── 2. Vérification que le domaine email existe réellement ───────────────
    let domainValid = true;
    try {
      domainValid = await isEmailDomainValid(normalizedEmail);
    } catch {
      // Erreur réseau → fail open (on laisse passer)
      console.warn("[createUser] DNS check failed, fail open");
    }

    if (!domainValid) {
      return res.status(400).json({
        message:
          "Le domaine de cet email n'existe pas ou n'accepte pas d'emails. Le compte n'a pas été créé.",
        emailDomainInvalid: true,
      });
    }

    // ── 3. Création du compte (emailVerified: false) ──────────────────────────
    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const user = await User.create({
      nom: nom.trim(),
      email: normalizedEmail,
      password,
      role: role || "user",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
      emailVerified: false, // ← compte inaccessible tant que non vérifié
    });

    // ── 4. Envoi de l'email de vérification ──────────────────────────────────
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
      // Rollback : supprimer le compte si l'email ne part pas
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({
        message:
          "Impossible d'envoyer l'email de vérification. Le compte n'a pas été créé. Vérifiez l'adresse email.",
        emailSendError: true,
      });
    }

    await createLog(
      "ADMIN_CREATE_USER",
      `Compte créé par admin pour : ${user.email} (en attente de vérification)`,
      req.user.id,
    );

    res.status(201).json({
      message:
        "Compte créé avec succès. Un email de vérification a été envoyé à l'utilisateur. Le compte sera actif après vérification.",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        actif: user.actif,
        emailVerified: false,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("Erreur createUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/:id (admin modifie un compte) ──────────────────────────────
// ✅ Mise à jour complète avec gestion du changement d'email (re-vérification si email change)
const updateUser = async (req, res) => {
  try {
    const { nom, email, password, role, telephone, competences, actif } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let emailChanged = false;

    // ── Mise à jour email ─────────────────────────────────────────────────────
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();

      // Unicité
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé par un autre compte",
          emailAlreadyExists: true,
        });
      }

      // Vérification DNS du nouveau domaine
      let domainValid = true;
      try {
        domainValid = await isEmailDomainValid(normalizedEmail);
      } catch {
        console.warn("[updateUser] DNS check failed, fail open");
      }

      if (!domainValid) {
        return res.status(400).json({
          message:
            "Le domaine du nouvel email n'existe pas ou n'accepte pas d'emails.",
          emailDomainInvalid: true,
        });
      }

      user.email = normalizedEmail;
      user.emailVerified = false; // ← doit re-vérifier le nouvel email
      emailChanged = true;
    }

    // ── Autres champs ─────────────────────────────────────────────────────────
    if (nom !== undefined) user.nom = nom.trim();
    if (role !== undefined) user.role = role;
    if (telephone !== undefined) user.telephone = telephone || null;
    if (competences !== undefined) user.competences = competences;
    if (actif !== undefined) user.actif = actif;

    // ── Nouveau mot de passe ──────────────────────────────────────────────────
    if (password && password.trim().length >= 6) {
      user.password = password; // le hook pre-save hashera automatiquement
    }

    await user.save();

    // ── Si email changé : envoyer email de vérification au nouveau email ──────
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
      `Compte modifié par admin : ${user.email}${emailChanged ? " (nouvel email — re-vérification requise)" : ""}`,
      req.user.id,
    );

    res.json({
      message: emailChanged
        ? "Compte mis à jour. Un email de vérification a été envoyé au nouveau email."
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
      `Rôle de ${user.email} changé en ${role}`,
      req.user.id,
    );

    res.json({ message: "Rôle mis à jour", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    await createLog(
      "DELETE_USER",
      `Compte supprimé : ${user.email}`,
      req.user.id,
    );

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── PUT /api/users/profile (utilisateur connecté modifie son profil) ──────────
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
      return res
        .status(400)
        .json({
          message: "Le nouveau mot de passe doit faire au moins 6 caractères",
        });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    user.password = newPassword; // hashé par le hook pre-save
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
  updateProfile,
  changePassword,
};