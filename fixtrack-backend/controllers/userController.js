// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const createLog = require("../utils/createLog");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

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

exports.createUser = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    if (!nom || !email || !password)
      return res
        .status(400)
        .json({ message: "Nom, email et mot de passe requis" });
    const VALID_ROLES = ["utilisateur", "technician", "manager", "admin"];
    if (role && !VALID_ROLES.includes(role))
      return res.status(400).json({ message: "Rôle invalide" });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    const user = new User({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "utilisateur",
      actif: true,
      avatar: "",
      telephone: null,
      competences: [],
    });
    await user.save();
    const created = await User.findById(user._id).select("-password");
    await createLog(
      "USER_CREATED",
      `Compte créé par admin : ${created.email} (${created.role})`,
      req.user.id,
    );
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nom, email, telephone, actif } = req.body;
    const update = {};
    if (nom !== undefined) update.nom = nom;
    if (email !== undefined) update.email = email.toLowerCase().trim();
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

exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const VALID_ROLES = ["utilisateur", "technician", "manager", "admin"];
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
// FIX : normalise email + retourne { message, user } avec données fraîches de la DB
exports.updateProfile = async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom && !email && !telephone)
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });

    const update = {};
    if (nom !== undefined && nom !== null) update.nom = nom.trim();
    if (telephone !== undefined) update.telephone = telephone;
    if (email !== undefined && email !== null) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.id },
      });
      if (existing)
        return res
          .status(400)
          .json({ message: "Email déjà utilisé par un autre compte" });
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

    // FIX : retourne { message, user } — le frontend lit user.email/user.nom exacts
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
