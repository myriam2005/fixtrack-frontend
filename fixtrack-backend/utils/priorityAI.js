// utils/priorityAI.js
// Algorithme de priorisation intelligente v2
// Généraliste — écoles, entreprises, hôtels, résidences, hôpitaux, commerces

const Ticket = require("../models/Ticket");

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────

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

const LOCATION_KEYWORDS = {
  // Forte affluence → +20
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
    // Résidentiel
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

  // Zones critiques de sécurité → +25
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
    "brasserie",
    "chambre froide",
    "stockage gaz",
  ],
};

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

// Amplificateurs de gravité dans la description
const SEVERITY_AMPLIFIERS = [
  "fort",
  "forte",
  "sévère",
  "grave",
  "important",
  "urgent",
  "immédiat",
  "total",
  "totale",
  "complète",
  "critique",
  "violent",
  "violente",
  "massif",
  "massive",
  "généralisé",
];

// Atténuateurs de gravité dans la description
const SEVERITY_DOWNPLAYERS = [
  "léger",
  "légère",
  "petit",
  "petite",
  "faible",
  "mineur",
  "mineure",
  "possible",
  "intermittent",
  "intermittente",
  "parfois",
  "occasionnel",
];

// Synergies catégorie × zone — combinaisons particulièrement dangereuses
const CATEGORY_ZONE_SYNERGIES = {
  Électrique: [
    "tableau électrique",
    "salle serveur",
    "datacenter",
    "chaufferie",
    "groupe électrogène",
  ],
  Incendie: [
    "cuisine",
    "office",
    "stockage gaz",
    "chambre froide",
    "brasserie",
    "jardin",
  ],
  Gaz: ["cuisine", "chaufferie", "stockage gaz", "brasserie"],
  HVAC: ["bloc", "urgences", "salle serveur", "datacenter"],
  Sécurité: ["sortie de secours", "escalier de secours", "issue de secours"],
  Ascenseur: ["cage d'escalier", "urgences", "bloc"],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pondération temporelle : un même incident a un impact très différent
 * selon l'heure et le jour.
 * Heures de pointe semaine → ×1.30
 * Heures creuses semaine   → ×1.00
 * Week-end                 → ×0.75
 */
function getTemporalMultiplier() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = dimanche, 6 = samedi

  const isWeekend = day === 0 || day === 6;
  const isPeakHour =
    (hour >= 7 && hour <= 9) || // arrivée
    (hour >= 12 && hour <= 14) || // pause déjeuner
    (hour >= 17 && hour <= 19); // départ

  if (isWeekend) return 0.75;
  if (!isWeekend && isPeakHour) return 1.3;
  return 1.0;
}

/**
 * Score de récurrence : un problème qui revient souvent au même endroit
 * est un problème systémique, pas un incident isolé.
 */
async function getRecurrenceScore(localisation) {
  try {
    const locSearch = (localisation || "")
      .split(/[\s\-—,]+/)
      .slice(0, 2)
      .join(" ");

    if (locSearch.length <= 2) return 0;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const regex = new RegExp(locSearch, "i");

    const [weekCount, monthCount] = await Promise.all([
      Ticket.countDocuments({
        localisation: { $regex: regex },
        createdAt: { $gte: startOfWeek },
      }),
      Ticket.countDocuments({
        localisation: { $regex: regex },
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    // Même endroit, même semaine = problème systémique
    if (weekCount >= 3) return 30;
    if (monthCount >= 5) return 25;
    if (monthCount >= 3) return 15;
    if (monthCount >= 2) return 8;
    return 0;
  } catch {
    return 0; // ne jamais bloquer sur une erreur DB
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function calculatePriority(ticketData) {
  const { categorie, urgence, localisation, description } = ticketData;

  const locLower = (localisation || "").toLowerCase();
  const descLower = (description || "").toLowerCase();
  const catLower = (categorie || "").toLowerCase();

  // ── Flags booléens (réutilisés partout) ────────────────────────────────────
  const isHighImpactCat = HIGH_IMPACT_CATEGORIES.some(
    (c) => c.toLowerCase() === catLower,
  );
  const isHighTraffic = LOCATION_KEYWORDS.high_traffic.some((kw) =>
    locLower.includes(kw),
  );
  const isCriticalZone = LOCATION_KEYWORDS.critical_zones.some((kw) =>
    locLower.includes(kw),
  );
  const isDangerKeyword = DANGER_KEYWORDS.some(
    (kw) => descLower.includes(kw) || locLower.includes(kw),
  );
  const hasAmplifier = SEVERITY_AMPLIFIERS.some((w) => descLower.includes(w));
  const hasDownplayer = SEVERITY_DOWNPLAYERS.some((w) => descLower.includes(w));

  const urgenceMap = { critical: 25, high: 15, medium: 8, low: 2 };
  const urgenceScore = urgenceMap[urgence] || 0;

  // ── 1. Catégorie à impact élevé ────────────────────────────────────────────
  const categorieScore = isHighImpactCat ? 30 : 0;

  // ── 2. Urgence déclarée ────────────────────────────────────────────────────
  // (urgenceScore déjà calculé)

  // ── 3. Localisation à forte fréquentation ─────────────────────────────────
  const trafficScore = isHighTraffic ? 20 : 0;

  // ── 4. Zone critique de sécurité ──────────────────────────────────────────
  const criticalZoneScore = isCriticalZone ? 25 : 0;

  // ── 5. Mots-clés danger ────────────────────────────────────────────────────
  const dangerScore = isDangerKeyword ? 15 : 0;

  // ── 6. Récurrence (requête DB async) ──────────────────────────────────────
  const recurrenceScore = await getRecurrenceScore(localisation);

  // ── 7. Synergies catégorie × zone ─────────────────────────────────────────
  const criticalZoneList = CATEGORY_ZONE_SYNERGIES[categorie] || [];
  const hasCatZoneSynergy = criticalZoneList.some((kw) =>
    locLower.includes(kw),
  );

  const synergies = {
    catZone: hasCatZoneSynergy ? 15 : 0, // ex: Électrique + salle serveur
    dangerTraffic: isDangerKeyword && isHighTraffic ? 12 : 0, // danger dans zone fréquentée
    urgenceDanger: urgence === "critical" && isDangerKeyword ? 10 : 0, // urgence max + mot danger
    catDanger: isHighImpactCat && isDangerKeyword ? 10 : 0, // catégorie critique + danger
  };
  const synergyScore = Object.values(synergies).reduce((a, b) => a + b, 0);

  // ── 8. Modificateur NLP (sévérité de la description) ──────────────────────
  let nlpDelta = 0;
  if (hasAmplifier && !hasDownplayer) nlpDelta = +10;
  if (hasDownplayer && !hasAmplifier) nlpDelta = -8;

  // ── Somme brute ────────────────────────────────────────────────────────────
  const rawScore =
    categorieScore +
    urgenceScore +
    trafficScore +
    criticalZoneScore +
    dangerScore +
    recurrenceScore +
    synergyScore +
    nlpDelta;

  // ── 9. Pondération temporelle ──────────────────────────────────────────────
  const temporalMultiplier = getTemporalMultiplier();
  const temporalDelta = Math.round(rawScore * (temporalMultiplier - 1));

  // ── Score final normalisé ──────────────────────────────────────────────────
  const score = Math.min(100, Math.max(0, rawScore + temporalDelta));

  // ── Mapping score → priorité ───────────────────────────────────────────────
  let priorite;
  if (score >= 80) priorite = "critical";
  else if (score >= 60) priorite = "high";
  else if (score >= 35) priorite = "medium";
  else priorite = "low";

  // ── Breakdown complet (pour logs, debug, et affichage frontend) ───────────
  const breakdown = {
    categorie: categorieScore,
    urgence: urgenceScore,
    localisation: trafficScore + criticalZoneScore,
    danger: dangerScore,
    recurrence: recurrenceScore,
    synergies: synergyScore,
    nlp: nlpDelta,
    temporal: temporalDelta,
  };

  const activeFactors = Object.entries(breakdown)
    .filter(([, v]) => v !== 0)
    .map(([k]) => k);

  return {
    score,
    priorite,
    breakdown,
    meta: {
      temporalMultiplier,
      activeFactors,
      activeSynergies: Object.entries(synergies)
        .filter(([, v]) => v > 0)
        .map(([k]) => k),
      computedAt: new Date().toISOString(),
    },
  };
}

module.exports = calculatePriority;
