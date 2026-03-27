// models/Ticket.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  auteur: { type: Schema.Types.ObjectId, ref: "User" },
  texte: { type: String, required: true },
  type: {
    type: String,
    enum: ["note", "solution", "validation"],
    default: "note",
  },
  date: { type: Date, default: Date.now },
});

const ticketSchema = new Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: { type: String, trim: true, default: "" },
    statut: {
      type: String,
      enum: [
        "open",
        "assigned",
        "in_progress",
        "pending",
        "resolved",
        "closed",
        "refused", // ✅ NOUVEAU
      ],
      default: "open",
    },
    priorite: {
      type: String,
      enum: [
        "basse",
        "moyenne",
        "haute",
        "critique",
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "moyenne",
    },
    scoreIA: { type: Number, default: 0 },
    categorie: {
      type: String,
      required: [true, "La catégorie est requise"],
      trim: true,
    },
    localisation: {
      type: String,
      required: [true, "La localisation est requise"],
      trim: true,
    },
    auteurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    auteurTel: { type: String, default: null },
    technicienId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ NOUVEAU — raison du refus renseignée par le technicien
    refusedReason: { type: String, default: null },
    refusedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    refusedAt: { type: Date, default: null },

    notes: [noteSchema],
    feedback: {
      note: { type: Number, min: 1, max: 5, default: null },
      commentaire: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

ticketSchema.virtual("dateCreation").get(function () {
  return this.createdAt;
});
ticketSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Ticket", ticketSchema);
