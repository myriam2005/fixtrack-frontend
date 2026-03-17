// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Récupère le token depuis le header Authorization: Bearer TOKEN
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Non autorisé — token manquant" });
    }

    const token = authHeader.split(" ")[1];

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajoute l'utilisateur à req pour les prochains middlewares
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Non autorisé — token invalide ou expiré" });
  }
};

module.exports = auth;
