// utils/priorityAI.js
// Algorithme de priorisation généraliste — fonctionne pour :
// écoles, entreprises, hôtels, résidences, hôpitaux, quartiers, etc.

const Ticket = require("../models/Ticket");

// ── Catégories à impact élevé (toujours critiques peu importe le contexte) ────
const HIGH_IMPACT_CATEGORIES = [
  "Électrique",
  "HVAC",
  "Informatique",
  "Sécurité",
  "Incendie",
  "Ascenseur",
  "Gaz",
  "Réseau",
];

// ── Mots-clés de localisation à haute fréquentation ──────────────────────────
// Organisés par type de lieu — chaque catégorie ajoute des points
const LOCATION_KEYWORDS = {
  // Lieux à forte affluence (+20)
  high_traffic: [
    // Éducation
    "amphi",
    "amphithéâtre",
    "salle",
    "classe",
    "cours",
    "labo",
    "laboratoire",
    "bibliothèque",
    "réfectoire",
    "cantine",
    "gymnase",
    // Hôtellerie / résidence
    "lobby",
    "réception",
    "hall",
    "restaurant",
    "piscine",
    "salle de sport",
    "salle de conférence",
    "salle de réunion",
    // Entreprise
    "open space",
    "plateau",
    "show room",
    "accueil",
    "bureau",
    // Résidentiel / quartier
    "cage d'escalier",
    "ascenseur",
    "parking",
    "entrée",
    "couloir commun",
    "local poubelle",
    "local technique",
    // Santé
    "urgences",
    "bloc",
    "consultation",
    "salle d'attente",
    "pharmacie",
    // Commerce
    "caisse",
    "surface de vente",
    "réserve",
    "quai",
    "magasin",
  ],

  // Zones critiques de sécurité (+25)
  critical_zones: [
    "sortie de secours",
    "escalier de secours",
    "issue de secours",
    "tableau électrique",
    "compteur",
    "sprinkler",
    "extincteur",
    "chaufferie",
    "sous-station",
    "groupe électrogène",
    "salle serveur",
    "datacenter",
    "local it",
    "baie informatique",
    "cuisine",
    "office",
    "brasserie", // risque incendie / hygiene
    "chambre froide",
    "stockage gaz",
  ],
};

async function calculatePriority(ticketData) {
  let score = 0;
  const { categorie, urgence, localisation, description } = ticketData;
  const locLower = (localisation || "").toLowerCase();
  const descLower = (description || "").toLowerCase();

  // ── 1. Catégorie (+30 si impact élevé) ────────────────────────────────────
  if (
    HIGH_IMPACT_CATEGORIES.some(
      (c) => c.toLowerCase() === (categorie || "").toLowerCase(),
    )
  )
    score += 30;

  // ── 2. Urgence déclarée par l'utilisateur ─────────────────────────────────
  const urgenceMap = { critical: 25, high: 15, medium: 8, low: 2 };
  score += urgenceMap[urgence] || 0;

  // ── 3. Localisation à forte fréquentation (+20) ───────────────────────────
  if (LOCATION_KEYWORDS.high_traffic.some((kw) => locLower.includes(kw)))
    score += 20;

  // ── 4. Zone critique de sécurité (+25) ────────────────────────────────────
  if (LOCATION_KEYWORDS.critical_zones.some((kw) => locLower.includes(kw)))
    score += 25;

  // ── 5. Mots-clés danger dans la description (+15) ─────────────────────────
  const DANGER_KEYWORDS = [
    "feu",
    "fumée",
    "incendie",
    "inondation",
    "fuite gaz",
    "odeur gaz",
    "court-circuit",
    "électrocution",
    "blessé",
    "accident",
    "bloqué",
    "coincé",
    "inaccessible",
    "interdit",
    "dangereux",
    "risque chute",
    "sol glissant",
    "effondrement",
  ];
  if (
    DANGER_KEYWORDS.some(
      (kw) => descLower.includes(kw) || locLower.includes(kw),
    )
  )
    score += 15;

  // ── 6. Volume d'incidents récents sur la même localisation (+20) ──────────
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Extrait les 2 premiers mots de la localisation pour la recherche
    const locSearch = (localisation || "")
      .split(/[\s\-—,]+/)
      .slice(0, 2)
      .join(" ");
    if (locSearch.length > 2) {
      const count = await Ticket.countDocuments({
        localisation: { $regex: new RegExp(locSearch, "i") },
        createdAt: { $gte: startOfMonth },
      });
      if (count >= 3) score += 20;
      else if (count >= 2) score += 10;
    }
  } catch {
    /* ne pas bloquer si la requête échoue */
  }

  // ── Normalisation ──────────────────────────────────────────────────────────
  score = Math.min(100, Math.max(0, score));

  // ── Mapping score → priorité ───────────────────────────────────────────────
  let priorite;
  if (score >= 80) priorite = "critical";
  else if (score >= 60) priorite = "high";
  else if (score >= 35) priorite = "medium";
  else priorite = "low";

  return { score, priorite };
}

module.exports = calculatePriority;
