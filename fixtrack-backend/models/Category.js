// models/Category.js
// ⚠️  nombreTickets est calculé à la volée (Ticket.countDocuments)
//     et ne doit PAS être stocké en base — il serait vite désynchronisé.
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
