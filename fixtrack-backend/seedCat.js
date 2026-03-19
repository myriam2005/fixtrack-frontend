const mongoose = require("mongoose");
require("dotenv").config();

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGODB_URL;

const S = new mongoose.Schema(
  { nom: { type: String, unique: true, trim: true } },
  { timestamps: true },
);

mongoose
  .connect(uri)
  .then(async () => {
    const C = mongoose.models.Category || mongoose.model("Category", S);

    const cats = [
      "Électrique",
      "HVAC",
      "Informatique",
      "Mécanique",
      "Plomberie",
      "Sécurité",
    ];

    for (const nom of cats) {
      await C.findOneAndUpdate(
        { nom },
        { nom },
        { upsert: true, setDefaultsOnInsert: true },
      );
      console.log("Créée : " + nom);
    }

    console.log("Terminé - toutes les catégories sont dans MongoDB");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Erreur:", e.message);
    process.exit(1);
  });
