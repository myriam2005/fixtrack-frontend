// models/PendingUser.js
// Stocke les comptes en attente de vérification email.
// Un PendingUser n'est PAS un vrai User — il n'existe pas dans la collection "users".
// À la validation email, on le migre vers User puis on le supprime d'ici.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const pendingUserSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Mot de passe hashé — copié tel quel vers User lors de la migration
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "technician", "manager", "admin"],
      default: "user",
    },
    avatar: { type: String, default: "" },
    telephone: { type: String, default: null },
    competences: { type: [String], default: [] },

    // Token de vérification
    emailVerificationToken: { type: String, required: true },
    emailVerificationTokenExpires: { type: Date, required: true },
    emailVerificationSentAt: { type: Date, default: Date.now },

    // Qui a créé ce compte en attente (admin ou auto-inscription)
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Hash password avant sauvegarde ────────────────────────────────────────────
pendingUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Génère et stocke un token de vérification hashé ──────────────────────────
pendingUserSchema.methods.generateVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.emailVerificationTokenExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ); // 24h
  this.emailVerificationSentAt = new Date();
  return rawToken; // retourné en clair pour l'email, stocké hashé
};

// ── Vérifie si un token brut correspond au token hashé stocké ────────────────
pendingUserSchema.methods.isTokenValid = function (rawToken) {
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
  return (
    this.emailVerificationToken === hashed &&
    this.emailVerificationTokenExpires > new Date()
  );
};

// ── TTL : suppression automatique 48h après création si jamais validé ─────────
// Cela évite les comptes "fantômes" en attente indéfinie
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 48 * 60 * 60 });

module.exports = mongoose.model("PendingUser", pendingUserSchema);
