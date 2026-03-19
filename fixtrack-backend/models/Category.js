const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    nombreTickets: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
