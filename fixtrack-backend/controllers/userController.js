// controllers/userController.js
const User = require("../models/User");
const createLog = require("../utils/createLog");

// ── GET /api/users — admin only ───────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/users/:id/role — admin only ──────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["employee", "technician", "manager", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    await createLog(
      "USER_ROLE_UPDATED",
      `Rôle changé en ${role} pour ${user.email}`,
      req.user.id,
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/users/:id — update profile ───────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { nom, telephone, competences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, telephone, competences },
      { new: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/users/:id — soft delete (admin only) ─────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    await createLog(
      "USER_DEACTIVATED",
      `Compte désactivé : ${user.email}`,
      req.user.id,
      "warning",
    );

    res.json({ message: "Utilisateur désactivé avec succès", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getTechnicians,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser,
};
