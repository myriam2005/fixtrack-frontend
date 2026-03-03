// src/pages/admin/tickets/TicketsModalConstants.js
// Constants for TicketsModal component

export const STATUS_OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "assigned", label: "Assigné" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Clôturé" },
];

export const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critique" },
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Basse" },
];

// ✅ Single source of truth — imported by anyone who needs status/priority colors
export const STATUS_CONFIG = {
  open: { label: "Ouvert", color: "#3B82F6" },
  assigned: { label: "Assigné", color: "#8B5CF6" },
  in_progress: { label: "En cours", color: "#F59E0B" },
  resolved: { label: "Résolu", color: "#22C55E" },
  closed: { label: "Clôturé", color: "#6B7280" },
};

export const PRIORITY_BORDER = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#D1D5DB",
};

// ── Styles champs partagés ─────────────────────────────────────────────────────

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "13.5px",
    backgroundColor: "#F9FAFB",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontSize: "13px", color: "#6B7280" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

export const selectSx = {
  borderRadius: "10px",
  fontSize: "13.5px",
  backgroundColor: "#F9FAFB",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563EB",
    borderWidth: "1.5px",
  },
};
