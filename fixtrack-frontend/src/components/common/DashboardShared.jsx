// src/components/common/DashboardShared.jsx
// ─────────────────────────────────────────────────────────────
//  FixTrack — Composants réutilisables entre tous les dashboards
//  Utilisé par : EmpDashboard, TechDashboard, MgrDashboard, AdminDashboard
// ─────────────────────────────────────────────────────────────

import { Box, Paper, Typography } from "@mui/material";

// ── Icônes SVG partagées ───────────────────────────────────────────────────────
export const DashboardIcon = {
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tool: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  alertTriangle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  barChart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  arrowRight: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  filter: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  wave: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
};

// ── DashboardHeader ───────────────────────────────────────────────────────────
/**
 * Props :
 *  - firstName  {string}  Prénom de l'utilisateur
 *  - greeting   {string}  "Bonjour" / "Bon après-midi" / "Bonsoir"
 *  - subtitle   {string}  Sous-titre descriptif
 *  - rightSlot  {node}    Contenu optionnel à droite (bouton, badge, etc.)
 */
export function DashboardHeader({ firstName, greeting, subtitle, rightSlot }) {
  return (
    <Box sx={{
      borderRadius: "12px",
      background: "linear-gradient(120deg, #1E3A5F 0%, #2563EB 100%)",
      padding: "14px 20px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 3px 14px rgba(37,99,235,0.20)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Déco cercle */}
      <Box sx={{
        position: "absolute", top: -20, right: 40,
        width: 100, height: 100, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.07)",
        pointerEvents: "none",
      }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px",
          backgroundColor: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "#FCD34D",
        }}>
          {DashboardIcon.wave}
        </Box>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {greeting}, {firstName} 👋
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", mt: "1px" }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {rightSlot && (
        <Box sx={{ zIndex: 1, flexShrink: 0 }}>
          {rightSlot}
        </Box>
      )}
    </Box>
  );
}

// ── KpiCard ───────────────────────────────────────────────────────────────────
/**
 * Props :
 *  - icon        {node}    Icône SVG
 *  - label       {string}  Libellé court (ex: "Tickets ouverts")
 *  - count       {number}  Valeur principale
 *  - color       {string}  Couleur accent (#hex)
 *  - bgColor     {string}  Couleur de fond légère (#hex)
 *  - description {string}  Sous-texte optionnel
 */
export function KpiCard({ icon, label, count, color, bgColor, description }) {
  return (
    <Paper elevation={0} sx={{
      borderRadius: "14px",
      padding: "20px 22px",
      border: "1px solid #E5E7EB",
      backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
    }}>
      {/* Cercle décoratif */}
      <Box sx={{
        position: "absolute", top: -28, right: -28,
        width: 90, height: 90, borderRadius: "50%",
        backgroundColor: bgColor, opacity: 0.7,
      }} />
      {/* Barre de couleur en bas */}
      <Box sx={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, ${color}66)`,
      }} />

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "8px" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "36px", fontWeight: 900, color: "#111827", lineHeight: 1, letterSpacing: "-0.04em" }}>
            {count}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: "5px" }}>{description}</Typography>
          )}
        </Box>
        <Box sx={{
          width: 42, height: 42, borderRadius: "11px",
          backgroundColor: bgColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, flexShrink: 0,
        }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

// ── Helpers partagés ──────────────────────────────────────────────────────────

/** Retourne la salutation selon l'heure */
export function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
}

/** Formate une date en fr-FR lisible */
export function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}