// utils/priorityAI.js
// Algorithme de calcul de score de priorité (0-100)
// Appelé dans POST /api/tickets

const Ticket = require("../models/Ticket");

/**
 * Calcule la priorité d'un ticket selon plusieurs critères
 * @param {Object} ticketData - données du ticket (avant sauvegarde)
 * @returns {Promise<{score: number, priorite: string}>}
 */
async function calculatePriority(ticketData) {
  let score = 0;

  const { categorie, urgence, localisation } = ticketData;

  // +30 si catégorie critique pour l'activité
  const categoriesCritiques = [
    "Informatique",
    "Électrique",
    "HVAC",
    "Sécurité",
  ];
  if (categoriesCritiques.includes(categorie)) {
    score += 30;
  }

  // +20 si urgence déclarée = activité arrêtée
  if (urgence === "critical") {
    score += 25;
  } else if (urgence === "high") {
    score += 15;
  } else if (urgence === "medium") {
    score += 8;
  }

  // +20 si machine dans une salle de cours ou laboratoire
  const locationsHautePriorite = [
    "amphi",
    "amphithéâtre",
    "salle",
    "laboratoire",
    "labo",
    "classe",
    "cours",
    "tp",
    "informatique",
    "scolarité",
  ];
  const locLower = (localisation || "").toLowerCase();
  if (locationsHautePriorite.some((kw) => locLower.includes(kw))) {
    score += 20;
  }

  // +20 si plus de 3 incidents ce mois sur la même localisation
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const incidentsCount = await Ticket.countDocuments({
      localisation: { $regex: new RegExp(localisation, "i") },
      createdAt: { $gte: startOfMonth },
    });

    if (incidentsCount >= 3) {
      score += 20;
    }
  } catch {
    // Ne pas bloquer si la requête échoue
  }

  // Normaliser entre 0 et 100
  score = Math.min(100, Math.max(0, score));

  // Mapper le score vers une priorité
  let priorite;
  if (score >= 80) priorite = "critical";
  else if (score >= 60) priorite = "high";
  else if (score >= 35) priorite = "medium";
  else priorite = "low";

  return { score, priorite };
}

module.exports = calculatePriority;
