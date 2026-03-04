// src/components/common/BadgeConstants.js
// Constants for Badge component styling

export const TOKENS = {
  // ── Statuts tickets ────────────────────────────────────────────────────────
  open: { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  assigned: {
    dot: "#6366F1",
    bg: "#EEF2FF",
    text: "#4338CA",
    border: "#C7D2FE",
  },
  in_progress: {
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
  },
  pending: {
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
  },
  resolved: {
    dot: "#10B981",
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
  },
  closed: { dot: "#6B7280", bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },

  // ── Priorités ──────────────────────────────────────────────────────────────
  critical: {
    dot: "#EF4444",
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
  },
  high: { dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  medium: { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  low: { dot: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },

  // ── Statuts machines ───────────────────────────────────────────────────────
  en_service: {
    dot: "#10B981",
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
  },
  en_panne: {
    dot: "#EF4444",
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
  },
  en_maintenance: {
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
  },
};

export const LABELS = {
  open: "Ouvert",
  assigned: "Assigné",
  in_progress: "En cours",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Clôturé",
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
  en_service: "En service",
  en_panne: "En panne",
  en_maintenance: "En maintenance",
};
