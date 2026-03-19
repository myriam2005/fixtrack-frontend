// routes/configRoutes.js
// Routes : GET/POST/PUT/DELETE /api/config/categories
// Modèle simple — stocke les catégories dans MongoDB
// Si vous préférez ne pas créer un nouveau modèle, les catégories
// sont automatiquement lues depuis localStorage côté frontend (fallback).

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const createLog = require("../utils/createLog");

// ── Schéma inline (léger, pas besoin d'un fichier séparé) ────────────────────
const categorySchema = new mongoose.Schema(
  { nom: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true },
);
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

// ── GET /api/config/categories ───────────────────────────────────────────────
router.get("/categories", auth, async (req, res) => {
  try {
    const { Ticket } = require("../models/Ticket");
    const cats = await Category.find().sort({ nom: 1 });

    // Enrichir avec le nombre de tickets par catégorie
    const enriched = await Promise.all(
      cats.map(async (cat) => {
        let nombreTickets = 0;
        try {
          nombreTickets = await Ticket.countDocuments({ categorie: cat.nom });
        } catch {
          /* Ticket model may not exist yet */
        }
        return { ...cat.toObject(), _id: cat._id, nombreTickets };
      }),
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── POST /api/config/categories (admin) ──────────────────────────────────────
router.post("/categories", auth, roleCheck(["admin"]), async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom || !nom.trim())
      return res
        .status(400)
        .json({ message: "Le nom de la catégorie est requis" });

    const existing = await Category.findOne({ nom: nom.trim() });
    if (existing)
      return res.status(400).json({ message: "Cette catégorie existe déjà" });

    const cat = await new Category({ nom: nom.trim() }).save();
    await createLog(
      "CATEGORY_CREATED",
      `Catégorie créée : ${nom}`,
      req.user.id,
    );
    res.status(201).json({ ...cat.toObject(), nombreTickets: 0 });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── PUT /api/config/categories/:id (admin) ───────────────────────────────────
router.put("/categories/:id", auth, roleCheck(["admin"]), async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom || !nom.trim())
      return res.status(400).json({ message: "Le nom est requis" });

    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { nom: nom.trim() },
      { new: true },
    );
    if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });

    await createLog(
      "CATEGORY_UPDATED",
      `Catégorie modifiée : ${nom}`,
      req.user.id,
    );
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── DELETE /api/config/categories/:id (admin) ────────────────────────────────
router.delete(
  "/categories/:id",
  auth,
  roleCheck(["admin"]),
  async (req, res) => {
    try {
      const cat = await Category.findByIdAndDelete(req.params.id);
      if (!cat)
        return res.status(404).json({ message: "Catégorie introuvable" });

      await createLog(
        "CATEGORY_DELETED",
        `Catégorie supprimée : ${cat.nom}`,
        req.user.id,
        "warning",
      );
      res.json({ message: "Catégorie supprimée" });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  },
);

module.exports = router;
