// controllers/accountRequestController.js
// Route PUBLIQUE — pas de middleware auth requis
// POST /api/account-request

const User = require("../models/User");
const { notifyN8n, WEBHOOKS } = require("../utils/notifyN8n");

exports.submitAccountRequest = async (req, res) => {
  try {
    const { nom, email, telephone, role, message } = req.body;

    // Validation basique
    if (!nom?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Nom et email sont requis" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Format email invalide" });
    }

    // Vérifier si l'email est déjà utilisé
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Un compte existe déjà avec cet email" });
    }

    // Trouver les admins pour leur envoyer l'email
    const admins = await User.find({ role: "admin", actif: true }).select(
      "email nom",
    );
    const adminEmail =
      admins[0]?.email ||
      process.env.MANAGER_FALLBACK_EMAIL ||
      "admin@fixtrack.local";

    const submittedAt = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ── n8n Workflow 5 : email demande de compte → admin ──────────────
    notifyN8n(WEBHOOKS.ACCOUNT_REQUEST, {
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      telephone: telephone?.trim() || null,
      role: role || "utilisateur",
      message: message?.trim() || null,
      adminEmail,
      submittedAt,
      adminUrl: `${process.env.FRONTEND_URL}/admin/users`,
    });

    res.status(200).json({
      message:
        "Votre demande a été envoyée. Un administrateur vous contactera prochainement.",
    });
  } catch (err) {
    console.error("ACCOUNT REQUEST ERROR:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
