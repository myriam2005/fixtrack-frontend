// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const createLog = require("../utils/createLog");

// ── GET /api/users (admin) ────────────────────────────────────────────────────
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
    const techs = await User.find({ role: "technician", actif: true }).select(
      "-password",
    );
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

// ── PUT /api/users/:id (admin — modifier un user) ─────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { nom, email, telephone, actif } = req.body;
    const update = {};
    if (nom !== undefined) update.nom = nom;
    if (email !== undefined) update.email = email;
    if (telephone !== undefined) update.telephone = telephone;
    if (actif !== undefined) update.actif = actif;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    await createLog(
      "USER_UPDATED",
      `Profil modifié : ${user.email}`,
      req.user.id,
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/:id/role (admin — changer rôle) ───────────────────────────
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const VALID_ROLES = ["employee", "technician", "manager", "admin"];
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

// ── DELETE /api/users/:id (soft delete — actif = false) ──────────────────────
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

// ── PUT /api/users/profile (utilisateur connecté) ────────────────────────────
// NOTE : cette route DOIT être déclarée AVANT /:id dans userRoutes.js
exports.updateProfile = async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom && !email && !telephone)
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });

    // Vérifier unicité email si modifié
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing)
        return res
          .status(400)
          .json({ message: "Email déjà utilisé par un autre compte" });
    }

    const update = {};
    if (nom) update.nom = nom;
    if (email) update.email = email;
    if (telephone !== undefined) update.telephone = telephone;

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
    res.json({ message: "Profil mis à jour", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/users/password (utilisateur connecté) ───────────────────────────
// NOTE : cette route DOIT être déclarée AVANT /:id dans userRoutes.js
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Les deux mots de passe sont requis" });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({
          message: "Le nouveau mot de passe doit faire au moins 6 caractères",
        });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });

    user.password = newPassword; // le hook pre('save') va hasher automatiquement
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
