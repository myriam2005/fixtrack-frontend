// src/pages/employee/CreateTicket/wizardConstants.js

// ── SVG Icons ─────────────────────────────────────────────────────────────────
export const Icon = {
  Back: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Next: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  CheckLg: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Pin: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
    </svg>
  ),
  Image: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  File: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  // Category icons
  Zap: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Droplet: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Wind: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  ),
  Monitor: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Armchair: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z" />
      <line x1="5" y1="18" x2="5" y2="21" />
      <line x1="19" y1="18" x2="19" y2="21" />
    </svg>
  ),
  Sparkles: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69H21l-4.94 3.58a1 1 0 0 0-.36 1.12L17.56 20 12 16.24 6.44 20l1.86-5.85a1 1 0 0 0-.36-1.12L3 9.45h6.17a1 1 0 0 0 .95-.69z" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Settings: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  MoreCircle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Static data ───────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { value: "Électrique", IcoComp: Icon.Zap },
  { value: "Plomberie", IcoComp: Icon.Droplet },
  { value: "HVAC", IcoComp: Icon.Wind },
  { value: "Informatique", IcoComp: Icon.Monitor },
  { value: "Menuiserie/Mobilier", IcoComp: Icon.Armchair },
  { value: "Hygiène/Nettoyage", IcoComp: Icon.Sparkles },
  { value: "Sécurité", IcoComp: Icon.Shield },
  { value: "Mécanique", IcoComp: Icon.Settings },
  { value: "Autre", IcoComp: Icon.MoreCircle },
];

export const LOC_SUGGESTIONS = [
  "Bâtiment A",
  "Bâtiment B",
  "Bâtiment C",
  "Étage 1",
  "Étage 2",
  "RDC",
  "Sous-sol",
  "Salle de réunion",
  "Couloir",
  "Parking",
  "Cafétéria",
  "Accueil",
  "Terrasse",
];

export const URGENCES = [
  {
    value: "critical",
    label: "Activité arrêtée",
    desc: "Travail complètement bloqué",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    dot: "#EF4444",
  },
  {
    value: "high",
    label: "Activité ralentie",
    desc: "Travail difficile mais possible",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FCD34D",
    dot: "#F59E0B",
  },
  {
    value: "medium",
    label: "Activité normale",
    desc: "Problème gênant non bloquant",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#6EE7B7",
    dot: "#10B981",
  },
  {
    value: "low",
    label: "Peu urgent",
    desc: "À traiter quand possible",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#D1D5DB",
    dot: "#9CA3AF",
  },
];

export const STEPS = [
  { id: 0, label: "Problème", short: "Description du problème" },
  { id: 1, label: "Localisation", short: "Où et quelle catégorie" },
  { id: 2, label: "Urgence", short: "Niveau de priorité" },
  { id: 3, label: "Contact", short: "Vos coordonnées" },
  { id: 4, label: "Récapitulatif", short: "Vérification finale" },
];

// ── Validation ────────────────────────────────────────────────────────────────
export function validateStep(step, form) {
  const e = {};
  if (step === 0) {
    if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
    else if (form.titre.trim().length < 5) e.titre = "Minimum 5 caractères.";
    if (!form.description.trim())
      e.description = "La description est obligatoire.";
    else if (form.description.trim().length < 20)
      e.description = `${form.description.trim().length}/20 caractères minimum.`;
  }
  if (step === 1) {
    if (!form.localisation.trim())
      e.localisation = "La localisation est obligatoire.";
    if (!form.categorie) e.categorie = "Veuillez choisir une catégorie.";
    if (form.categorie === "Autre" && !form.categorieAutre.trim())
      e.categorieAutre = "Précisez la catégorie.";
  }
  if (step === 3) {
    if (form.telephone && !/^[+\d\s\-()]{6,20}$/.test(form.telephone))
      e.telephone = "Numéro invalide.";
  }
  return e;
}
