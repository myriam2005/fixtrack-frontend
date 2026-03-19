const Category = require("../models/Category");
const Ticket = require("../models/Ticket");

// ── GET /api/config/categories ────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ nom: 1 });
    // Enrichit avec le vrai nombre de tickets par catégorie
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
    res.status(201).json({ ...cat.toObject(), nombreTickets: 0 });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── PUT /api/config/categories/:id ───────────────────────────────────────────
exports.updateCategory = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom?.trim()) return res.status(400).json({ message: "Nom requis" });
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { nom: nom.trim() },
      { new: true },
    );
    if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });
    const count = await Ticket.countDocuments({ categorie: cat.nom });
    res.json({ ...cat.toObject(), nombreTickets: count });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ── DELETE /api/config/categories/:id ────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: "Catégorie introuvable" });
    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
