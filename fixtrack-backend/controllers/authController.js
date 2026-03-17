// controllers/authController.js
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const createLog = require("../utils/createLog");

// ── Generate JWT Token ────────────────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, role, telephone, competences } = req.body;

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Crée l'avatar à partir des initiales
    const initials = nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Crée le nouvel utilisateur
    const user = await User.create({
      nom,
      email: email.toLowerCase(),
      password,
      role: role || "employee",
      avatar: initials,
      telephone: telephone || null,
      competences: competences || [],
    });

    // Génère le token JWT
    const token = generateToken(user._id, user.role);

    // Log
    await createLog("REGISTER", `Nouveau compte créé : ${email}`, user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        competences: user.competences,
      },
    });
  } catch (error) {
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

    // Cherche l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifie que le compte est actif
    if (!user.actif) {
      return res
        .status(401)
        .json({ message: "Compte désactivé — contactez l'administrateur" });
    }

    // Vérifie le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Génère le token
    const token = generateToken(user._id, user.role);

    // Log
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = { register, login, getMe };
