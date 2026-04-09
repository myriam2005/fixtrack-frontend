const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dns = require("dns").promises;
const createLog = require("../utils/createLog");
const { notifyN8n, WEBHOOKS } = require("../utils/notifyN8n");
const { sendVerificationEmail } = require("../utils/emailService");

// ── Helper : vérifie domaine email (connus → MX → A → AAAA → fail open) ──────
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
  // Domaines du projet
  "fst.tn",
  "fixtrack.app",
  "fixtrack.local",
]);

async function isEmailDomainValid(email) {
  try {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    // ✅ Domaine connu → valide immédiatement sans DNS
    if (KNOWN_DOMAINS.has(domain)) return true;

    // 1. MX
    try {
      const mx = await dns.resolveMx(domain);
      if (mx && mx.length > 0) return true;
    } catch {
      /* fallback */
    }

    // 2. A
    try {
      const a = await dns.resolve4(domain);
      if (a && a.length > 0) return true;
    } catch {
      /* fallback */
    }

    // 3. AAAA
    try {
      const aaaa = await dns.resolve6(domain);
      if (aaaa && aaaa.length > 0) return true;
    } catch {
      /* rien */
    }

    return false;
  } catch {
    // ✅ Erreur inattendue → fail open (ne pas bloquer un email valide)
    return true;
  }
}

// ── GET /api/users ────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── GET /api/users/technicians ────────────────────────────────────────────────
exports.getTechnicians = async (req, res) => {
  try {
    const techs = await User.find({
      role: "technician",
      actif: { $ne: false },
    }).select("-password");
    res.json(techs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── POST /api/users ───────────────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const { nom, email, password, role, competences } = req.body;

    // 1. Champs requis
    if (!nom || !email || !password)
      return res
        .status(400)
        .json({ message: "Nom, email et mot de passe requis" });

    // 2. Rôle valide
    const VALID_ROLES = ["user", "technician", "manager", "admin"];
    if (role && !VALID_ROLES.includes(role))
      return res.status(400).json({ message: "Rôle invalide" });

    // 3. Format email basique
    const emailNormalized = email.toLowerCase().trim();
    if (!/\S+@\S+\.\S+/.test(emailNormalized))
      return res.status(400).json({ message: "Format d'email invalide" });

    // ✅ 4. Vérification domaine email (MX → A → AAAA)
    const domainValid = await isEmailDomainValid(emailNormalized);
    if (!domainValid) {
      return res.status(400).json({
        message:
          "Adresse email invalide — ce domaine n'existe pas ou n'accepte pas d'emails.",
        emailDomainInvalid: true,
      });
    }

    // 5. Email déjà utilisé
    const existing = await User.findOne({ email: emailNormalized });
    if (existing)
      return res.status(400).json({ message: "Cet email est déjà utilisé" });

    // 6. Création de l'utilisateur
    const user = new User({
      nom: nom.trim(),
      email: emailNormalized,
      password,
      role: role || "user",
      actif: true,
      avatar: "",
      telephone: null,
      competences: Array.isArray(competences) ? competences : [],
      emailVerified: false,
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // 7. Envoi email de vérification
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      user.email,
      user.nom,
      verificationToken,
      baseUrl,
    );

    const created = await User.findById(user._id).select("-password");

    if (!emailResult.success) {
      console.warn("⚠️  Email de vérification non envoyé:", emailResult.error);
      await createLog(
        "USER_CREATED_EMAIL_FAILED",
        `Compte créé par admin (email non envoyé) : ${created.email}`,
        req.user.id,
      );
      return res.status(201).json({
        message:
          "Utilisateur créé mais l'email de vérification n'a pas pu être envoyé",
        user: created,
        emailSendError: true,
        requiresEmailVerification: true,
      });
    }

    await createLog(
      "USER_CREATED",
      `Compte créé par admin : ${created.email} (${created.role}) — email de vérification envoyé`,
      req.user.id,
    );

    res.status(201).json({
      message:
        "Utilisateur créé. Un email de vérification a été envoyé à l'adresse email fournie.",
      user: created,
      requiresEmailVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { nom, email, telephone, actif, password, competences } = req.body;
    const update = {};

    if (nom !== undefined) update.nom = nom;
    if (telephone !== undefined) update.telephone = telephone;
    if (actif !== undefined) update.actif = actif;
    if (competences !== undefined && Array.isArray(competences))
      update.competences = competences;

    // ✅ Vérification email si modifié
    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      // Format basique
      if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
        return res.status(400).json({ message: "Format d'email invalide" });
      }

      // Vérification domaine DNS
      const domainValid = await isEmailDomainValid(normalizedEmail);
      if (!domainValid) {
        return res.status(400).json({
          message: "Ce domaine email n'existe pas ou n'accepte pas d'emails.",
          emailDomainInvalid: true,
        });
      }

      // Email déjà utilisé par un autre compte
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé par un autre compte.",
          emailAlreadyExists: true,
        });
      }

      update.email = normalizedEmail;
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
      }
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password.trim(), salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    await createLog(
      "USER_UPDATED",
      `Profil modifié : ${user.email}${password ? " (mot de passe changé)" : ""}`,
      req.user.id,
    );

    const sendNotification = require("../utils/sendNotification");
    const adminUser = await User.findById(req.user.id).select("-password");
    const changedFields = [];
    if (update.nom) changedFields.push("Nom");
    if (update.email) changedFields.push("Email");
    if (update.telephone) changedFields.push("Téléphone");
    if (update.actif !== undefined) changedFields.push("Statut");
    if (update.competences) changedFields.push("Compétences");
    if (update.password) changedFields.push("Mot de passe");

    const fieldList =
      changedFields.length > 0
        ? " Éléments modifiés : " + changedFields.join(", ") + "."
        : "";

    await sendNotification({
      userId: user._id,
      message: `Votre profil a été modifié par l'administrateur ${adminUser?.nom || "Administrateur"}.${fieldList}`,
      type: "profile_updated",
      meta: { adminName: adminUser?.nom || "Administrateur", changedFields },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/:id/role ───────────────────────────────────────────────────
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const VALID_ROLES = ["user", "technician", "manager", "admin"];
    if (!VALID_ROLES.includes(role))
      return res.status(400).json({ message: "Rôle invalide" });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    await createLog(
      "ROLE_CHANGED",
      `Rôle de ${user.email} → ${role}`,
      req.user.id,
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── DELETE /api/users/:id (désactivation douce) ───────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true },
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    await createLog(
      "USER_DEACTIVATED",
      `Compte désactivé : ${user.email}`,
      req.user.id,
    );
    res.json({ message: "Utilisateur désactivé", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom && !email && !telephone)
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });

    const update = {};
    if (nom !== undefined && nom !== null) update.nom = nom.trim();
    if (telephone !== undefined) update.telephone = telephone;

    // ✅ Vérification email si modifié
    if (email !== undefined && email !== null) {
      const normalizedEmail = email.toLowerCase().trim();

      // Format basique
      if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
        return res.status(400).json({ message: "Format d'email invalide" });
      }

      // ✅ Vérification domaine DNS (MX → A → AAAA → fail open)
      const domainValid = await isEmailDomainValid(normalizedEmail);
      if (!domainValid) {
        return res.status(400).json({
          message: "Ce domaine email n'existe pas ou n'accepte pas d'emails.",
          emailDomainInvalid: true,
        });
      }

      // ✅ Email déjà utilisé par un autre compte
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.id },
      });
      if (existing) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé par un autre compte.",
          emailAlreadyExists: true,
        });
      }

      update.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    await createLog(
      "PROFILE_UPDATED",
      `Profil mis à jour : ${user.email}`,
      req.user.id,
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
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/password ───────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Les deux mots de passe sont requis" });
    if (newPassword.length < 6)
      return res.status(400).json({
        message: "Le nouveau mot de passe doit faire au moins 6 caractères",
      });
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    user.password = newPassword;
    await user.save();
    await createLog(
      "PASSWORD_CHANGED",
      `Mot de passe modifié : ${user.email}`,
      req.user.id,
    );
    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
