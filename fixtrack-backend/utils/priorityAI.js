// utils/priorityAI.js
const Ticket = require("../models/Ticket");

/**
 * calculatePriority({ categorie, urgence, machineId, localisation })
 * Retourne { score, priorite }
 * Score de 0 à 100 pour déterminer la priorité automatiquement
 */
const calculatePriority = async ({
  categorie,
  urgence,
  machineId,
  localisation,
}) => {
  let score = 0;

  // +30 si catégorie critique pour l'activité
  if (["Informatique", "Électrique", "HVAC"].includes(categorie)) {
    score += 30;
  }

  // +20 si urgence = activité arrêtée
  if (urgence === "activite_arretee") {
    score += 20;
  } else if (urgence === "degradation") {
    score += 10;
  }

  // +20 si la machine a eu plus de 3 incidents ce mois
  if (machineId) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const incidentsCount = await Ticket.countDocuments({
        machineId,
        createdAt: { $gte: startOfMonth },
      });

      if (incidentsCount > 3) score += 20;
      else if (incidentsCount > 1) score += 10;
    } catch (e) {
      // ignore
    }
  }

  // +10 si localisation = salle de cours ou laboratoire
  const locLower = (localisation || "").toLowerCase();
  if (
    locLower.includes("salle") ||
    locLower.includes("amphi") ||
    locLower.includes("labo") ||
    locLower.includes("cours")
  ) {
    score += 10;
  }

  // +5 si Plomberie (risque sécurité)
  if (categorie === "Plomberie") score += 15;

  // Détermination de la priorité
  let priorite;
  if (score >= 80) priorite = "critical";
  else if (score >= 60) priorite = "high";
  else if (score >= 40) priorite = "medium";
  else priorite = "low";

  return { score, priorite };
};

module.exports = calculatePriority;
