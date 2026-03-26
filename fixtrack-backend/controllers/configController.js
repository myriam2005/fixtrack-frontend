// controllers/categoryController.js
const Category = require("../models/Category");
const Ticket = require("../models/Ticket");
const createLog = require("../utils/createLog");

const UNCATEGORIZED = "Non classé";

// ── GET /api/config/categories ────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ nom: 1 });
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await Ticket.countDocuments({ categorie: cat.nom });
        return { ...cat.toObject(), nombreTickets: count };
      }),
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── POST /api/config/categories ───────────────────────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom?.trim()) return res.status(400).json({ message: "Nom requis" });

    const existing = await Category.findOne({ nom: nom.trim() });
    if (existing)
      return res.status(400).json({ message: "Cette catégorie existe déjà" });

    const cat = await Category.create({ nom: nom.trim() });
    await createLog(
      "CATEGORY_CREATED",
      `Catégorie créée : ${nom}`,
      req.user.id,
    );
    res.status(201).json({ ...cat.toObject(), nombreTickets: 0 });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/config/categories/:id ───────────────────────────────────────────
// ✅ Cascade : renomme aussi tous les tickets qui portaient l'ancien nom
exports.updateCategory = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom?.trim()) return res.status(400).json({ message: "Nom requis" });

    // Récupère l'ancienne catégorie AVANT mise à jour
    const oldCat = await Category.findById(req.params.id);
    if (!oldCat)
      return res.status(404).json({ message: "Catégorie introuvable" });

    const oldNom = oldCat.nom;
    const newNom = nom.trim();

    // Vérifie doublon (en excluant soi-même)
    if (oldNom !== newNom) {
      const duplicate = await Category.findOne({ nom: newNom });
      if (duplicate)
        return res
          .status(400)
          .json({ message: "Une catégorie avec ce nom existe déjà" });
    }

    // Met à jour la catégorie
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { nom: newNom },
      { new: true },
    );

    // ✅ Cascade : met à jour tous les tickets qui avaient l'ancien nom
    let ticketsUpdated = 0;
    if (oldNom !== newNom) {
      const result = await Ticket.updateMany(
        { categorie: oldNom },
        { $set: { categorie: newNom } },
      );
      ticketsUpdated = result.modifiedCount;
    }

    await createLog(
      "CATEGORY_UPDATED",
      `Catégorie renommée : "${oldNom}" → "${newNom}" (${ticketsUpdated} ticket(s) mis à jour)`,
      req.user.id,
    );

    const count = await Ticket.countDocuments({ categorie: newNom });
    res.json({ ...cat.toObject(), nombreTickets: count, ticketsUpdated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── DELETE /api/config/categories/:id ────────────────────────────────────────
// ✅ Cascade : les tickets associés passent à "Non classé"
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });

    const nomSupprime = cat.nom;

    // ✅ Cascade : réassigne les tickets vers "Non classé"
    const result = await Ticket.updateMany(
      { categorie: nomSupprime },
      { $set: { categorie: UNCATEGORIZED } },
    );
    const ticketsReassigned = result.modifiedCount;

    await Category.findByIdAndDelete(req.params.id);

    await createLog(
      "CATEGORY_DELETED",
      `Catégorie supprimée : "${nomSupprime}" (${ticketsReassigned} ticket(s) → "${UNCATEGORIZED}")`,
      req.user.id,
      "warning",
    );

    res.json({
      message: "Catégorie supprimée",
      ticketsReassigned,
      newCategory: UNCATEGORIZED,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
