// src/components/common/notification/NotificationBell.styles.js
// Palette simplifiée — couleurs uniquement pour alertes critiques,
// tout le reste reste neutre pour éviter l'encombrement visuel.

export const bellButtonSx = (open) => ({
  width: 36,
  height: 36,
  borderRadius: "10px",
  border: "1px solid",
  borderColor: open ? "#2563EB" : "#E2E8F0",
  color: open ? "#2563EB" : "#64748B",
  backgroundColor: open ? "#EFF6FF" : "transparent",
  transition: "all 0.15s",
  "&:hover": {
    borderColor: "#2563EB",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
});

export const badgeSx = {
  position: "absolute",
  top: -4,
  right: -4,
  backgroundColor: "#EF4444",
  color: "#FFF",
  borderRadius: "10px",
  fontSize: 9,
  fontWeight: 800,
  minWidth: 16,
  height: 16,
  px: "3px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #FFFFFF",
  letterSpacing: "-0.3px",
};

export const panelSx = {
  position: "fixed",
  top: 68,
  right: 20,
  width: 368,
  backgroundColor: "#FFFFFF",
  borderRadius: "14px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 24px rgba(15,23,42,0.09), 0 1px 4px rgba(15,23,42,0.05)",
  zIndex: 9999,
  overflow: "hidden",
};

export const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 2.25,
  py: 1.75,
  borderBottom: "1px solid #F1F5F9",
  backgroundColor: "#FAFAFA",
};

export const unreadBadgeSx = {
  px: 0.875,
  py: 0.1,
  borderRadius: "20px",
  backgroundColor: "#2563EB",
  minWidth: 18,
  height: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const markAllBtnSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  px: 1.25,
  py: 0.5,
  borderRadius: "7px",
  cursor: "pointer",
  border: "1px solid #E2E8F0",
  backgroundColor: "#fff",
  transition: "all 0.12s",
  "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
};

export const listContainerSx = {
  maxHeight: 400,
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: 3 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: 4 },
};

export const emptyStateSx = {
  py: 6,
  textAlign: "center",
};

export const footerSx = {
  px: 2.25,
  py: 1.25,
  borderTop: "1px solid #F1F5F9",
  backgroundColor: "#FAFAFA",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
