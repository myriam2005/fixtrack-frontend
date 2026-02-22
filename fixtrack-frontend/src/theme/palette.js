// src/theme/palette.js
// ─────────────────────────────────────────────────────────────
//  FixTrack — Palette officielle Material UI
//  Source : charte graphique v1.0
// ─────────────────────────────────────────────────────────────

export const SIDEBAR_BG = "#1E3A5F";
export const SIDEBAR_HOVER = "rgba(255,255,255,0.08)";
export const SIDEBAR_ACTIVE_BG = "rgba(37,99,235,0.25)";
export const SIDEBAR_TEXT = "rgba(255,255,255,0.70)";
export const SIDEBAR_TEXT_ACTIVE = "#FFFFFF";
export const BADGE_COLOR = "#EF4444";

export const palette = {
  primary: {
    main: "#2563EB",
    light: "#3B82F6",
    dark: "#1D4ED8",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#1E3A5F",
    light: "#2A4F7C",
    dark: "#152B4A",
    contrastText: "#FFFFFF",
  },
  success: {
    main: "#22C55E",
    light: "#86EFAC",
    dark: "#15803D",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#F59E0B",
    light: "#FCD34D",
    dark: "#B45309",
    contrastText: "#FFFFFF",
  },
  info: {
    main: "#3B82F6",
    light: "#93C5FD",
    dark: "#1D4ED8",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#EF4444",
    light: "#FCA5A5",
    dark: "#B91C1C",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F3F4F6",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    disabled: "#9CA3AF",
  },
  divider: "#E5E7EB",

  // ── Custom tokens (accès via theme.palette.custom.*) ──
  custom: {
    sidebarBg: SIDEBAR_BG,
    sidebarHover: SIDEBAR_HOVER,
    sidebarActiveBg: SIDEBAR_ACTIVE_BG,
    sidebarText: SIDEBAR_TEXT,
    sidebarTextActive: SIDEBAR_TEXT_ACTIVE,
    badgeColor: BADGE_COLOR,
    cardBorder: "#E5E7EB",
    inputBg: "#F9FAFB",
    overlayLight: "rgba(37,99,235,0.06)",
  },
};
