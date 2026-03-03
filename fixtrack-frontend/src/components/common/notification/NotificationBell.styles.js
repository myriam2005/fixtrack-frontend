// src/components/common/notification/NotificationBell.styles.js

// ── Mapping couleur par event/type ────────────────────────────────────────────
const COLOR_MAP = {
  ticket_created:     "#2563EB",
  ticket_assigned:    "#2563EB",
  ticket_reassigned:  "#475569",
  ticket_resolved:    "#16A34A",
  ticket_closed:      "#475569",
  ticket_in_progress: "#2563EB",
  ticket_critical:    "#DC2626",
  success:            "#16A34A",
  warning:            "#D97706",
  error:              "#DC2626",
  info:               "#2563EB",
};

export function getIconColor(event, type, isRead) {
  if (isRead) return "#94A3B8";
  return COLOR_MAP[event] || COLOR_MAP[type] || "#2563EB";
}

// ── Labels événements ─────────────────────────────────────────────────────────
export const EVENT_LABEL = {
  ticket_created:     "Nouveau ticket",
  ticket_assigned:    "Assignation",
  ticket_reassigned:  "Réassignation",
  ticket_resolved:    "Résolution",
  ticket_closed:      "Clôture",
  ticket_in_progress: "En cours",
  ticket_critical:    "Critique",
  success:            "Succès",
  warning:            "Attention",
  error:              "Erreur",
  info:               "Information",
};

// ── Styles sx ─────────────────────────────────────────────────────────────────

export const bellButtonSx = (open) => ({
  width: 36, height: 36, borderRadius: "8px",
  border: "1px solid",
  borderColor: open ? "#2563EB" : "#E2E8F0",
  color:       open ? "#2563EB" : "#475569",
  backgroundColor: open ? "#EFF6FF" : "transparent",
  transition: "all 0.15s",
  "&:hover": { borderColor: "#2563EB", color: "#2563EB", backgroundColor: "#EFF6FF" },
});

export const badgeSx = {
  position: "absolute", top: -5, right: -5,
  backgroundColor: "#EF4444", color: "#FFF",
  borderRadius: "10px", fontSize: 9, fontWeight: 800,
  minWidth: 17, height: 17, px: "4px",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "2px solid #FFFFFF",
};

export const panelSx = {
  position: "fixed", top: 70, right: 24,
  width: 380,
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 32px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)",
  zIndex: 9999,
  overflow: "hidden",
};

export const headerSx = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  px: 2.5, py: 1.75,
  borderBottom: "1px solid #F1F5F9",
};

export const unreadBadgeSx = {
  px: 1, py: 0.2, borderRadius: "20px",
  backgroundColor: "#2563EB",
};

export const markAllBtnSx = {
  display: "flex", alignItems: "center", gap: 0.5,
  px: 1.25, py: 0.5, borderRadius: "6px", cursor: "pointer",
  border: "1px solid #E2E8F0",
  transition: "all 0.12s",
  "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
};

export const listContainerSx = {
  maxHeight: 420, overflowY: "auto",
  "&::-webkit-scrollbar": { width: 3 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: 4 },
};

export const emptyStateSx = {
  py: 7, textAlign: "center",
};

export const footerSx = {
  px: 2.5, py: 1.25,
  borderTop: "1px solid #F1F5F9",
  display: "flex", justifyContent: "space-between", alignItems: "center",
};

export const itemWrapperSx = {
  display: "flex", alignItems: "flex-start", gap: 0,
  cursor: "pointer",
  position: "relative",
  transition: "background 0.12s",
  "&:hover": { backgroundColor: "#F8FAFC" },
  "&:hover .remove-btn": { opacity: 1 },
};

export const accentBarSx = (color, isRead) => ({
  width: 3, alignSelf: "stretch", flexShrink: 0,
  backgroundColor: isRead ? "transparent" : color,
  borderRadius: "0 2px 2px 0",
  transition: "background 0.2s",
});

export const iconBoxSx = (color, isRead) => ({
  width: 32, height: 32, flexShrink: 0,
  borderRadius: "8px",
  backgroundColor: isRead ? "#F1F5F9" : `${color}14`,
  border: `1px solid ${isRead ? "#E2E8F0" : `${color}30`}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  color,
  mt: 0.2,
  transition: "all 0.2s",
});

export const labelSx = (color, isRead) => ({
  fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
  textTransform: "uppercase",
  color: isRead ? "#94A3B8" : color,
  lineHeight: 1,
});

export const timestampSx = {
  fontSize: 10, color: "#94A3B8", lineHeight: 1, flexShrink: 0, ml: 1,
};

export const messageSx = (isRead) => ({
  fontSize: 12.5, lineHeight: 1.5,
  fontWeight: isRead ? 400 : 500,
  color: isRead ? "#64748B" : "#1E293B",
});

export const unreadDotSx = (color) => ({
  width: 6, height: 6, borderRadius: "50%",
  backgroundColor: color,
});

export const removeButtonSx = {
  opacity: 0, width: 18, height: 18,
  color: "#CBD5E1", transition: "opacity 0.12s",
  "&:hover": { color: "#94A3B8" },
};