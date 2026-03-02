// src/components/common/DashboardShared.jsx
// ─────────────────────────────────────────────────────────────
//  FixTrack — Composants réutilisables entre tous les dashboards
//  Utilisé par : EmpDashboard, TechDashboard, MgrDashboard, AdminDashboard
// ─────────────────────────────────────────────────────────────

import { Box, Paper, Typography } from "@mui/material";
import { DashboardIcon } from "./DashboardIconConstants";

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

