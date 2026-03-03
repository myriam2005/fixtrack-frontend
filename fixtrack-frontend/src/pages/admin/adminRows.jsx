// src/pages/admin/adminRows.jsx
// UserRow · AuditRow · UrgentRow · TechGauge · SectionHeader

import { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import { DashboardIcon } from "../../components/common/DashboardIconConstants";
export const ROLE_CONFIG = {
  employee:   { label: "Employé",    color: "#3B82F6", bg: "#EFF6FF" },
  technician: { label: "Technicien", color: "#8B5CF6", bg: "#F5F3FF" },
  manager:    { label: "Manager",    color: "#F59E0B", bg: "#FFFBEB" },
  admin:      { label: "Admin",      color: "#EF4444", bg: "#FEF2F2" },
};

export const PRIORITY_COLOR = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#22C55E",
};

const Ico = {
  shield:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  user:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  upload:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
};

export const AUDIT_ICONS = Ico;

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, right }) {
  return (
    <Box sx={{ padding: "15px 20px 12px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: "1px" }}>{subtitle}</Typography>}
      </Box>
      {right}
    </Box>
  );
}

// ── UserRow ───────────────────────────────────────────────────────────────────
export function UserRow({ user, isLast }) {
  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;
  const isOnline = ["u1", "u2"].includes(user.id);
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px", padding: "10px 18px", transition: "background 0.15s", "&:hover": { backgroundColor: "#F8FAFF" } }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #818CF8, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>
            {user.avatar}
          </Box>
          <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", backgroundColor: isOnline ? "#22C55E" : "#D1D5DB", border: "2px solid #fff" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.nom}</Typography>
          <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</Typography>
        </Box>
        <Box sx={{ padding: "2px 9px", borderRadius: "999px", backgroundColor: roleCfg.bg, color: roleCfg.color, fontSize: "10.5px", fontWeight: 700, flexShrink: 0 }}>
          {roleCfg.label}
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── AuditRow ──────────────────────────────────────────────────────────────────
export function AuditRow({ entry, isLast }) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 18px", transition: "background 0.15s", "&:hover": { backgroundColor: "#F8FAFF" } }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366F1", flexShrink: 0, mt: "1px" }}>
          {Ico[entry.icon]}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827", lineHeight: 1.35, mb: "2px" }}>{entry.action}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>{entry.actor}</Typography>
            <Typography sx={{ fontSize: "10.5px", color: "#D1D5DB" }}>·</Typography>
            <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>Il y a {entry.time}</Typography>
          </Box>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── UrgentRow ─────────────────────────────────────────────────────────────────
export function UrgentRow({ ticket, isLast }) {
  return (
    <>
      <Box sx={{
        display: "flex", alignItems: "center", gap: "11px",
        padding: "11px 18px 11px 15px",
        borderLeft: `3px solid ${PRIORITY_COLOR[ticket.priorite]}`,
        borderRadius: "0 10px 10px 0",
        transition: "background 0.15s, padding-left 0.15s",
        "&:hover": { backgroundColor: "#FAFAFA", paddingLeft: "19px" },
      }}>
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: PRIORITY_COLOR[ticket.priorite],
          boxShadow: `0 0 0 3px ${PRIORITY_COLOR[ticket.priorite]}22`,
          animation: ticket.priorite === "critical" ? "kpulse 1.4s ease-in-out infinite" : "none",
          "@keyframes kpulse": { "0%,100%": { opacity: 1, transform: "scale(1)" }, "50%": { opacity: 0.4, transform: "scale(1.6)" } },
        }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "12.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "2px" }}>{ticket.titre}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
            {DashboardIcon.pin}
            <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>{ticket.localisation}</Typography>
          </Box>
        </Box>
        <Badge status={ticket.priorite} />
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── TechGauge ─────────────────────────────────────────────────────────────────
export function TechGauge({ tech, assigned, total, resolved }) {
  const [hov, setHov] = useState(false);
  const pct       = total > 0 ? Math.round((assigned / total) * 100) : 0;
  const resPct    = total > 0 ? Math.round((resolved / total) * 100) : 100;
  const loadColor = pct > 60 ? "#EF4444" : pct > 30 ? "#F59E0B" : "#22C55E";
  const SIZE = 52, r = 19, cx = SIZE / 2, cy = SIZE / 2;
  const circ  = 2 * Math.PI * r;
  const score = Math.max(resPct, 5);

  return (
    <Box onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      sx={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "9px 13px", borderRadius: "12px",
        border: `1px solid ${hov ? "#DBEAFE" : "#F3F4F6"}`,
        backgroundColor: hov ? "#F8FAFF" : "#fff",
        transition: "all 0.18s", cursor: "default",
      }}>
      <Box sx={{ flexShrink: 0, position: "relative", width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={loadColor} strokeWidth="5"
            strokeDasharray={`${(score / 100) * circ} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #818CF8, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "9px", fontWeight: 700 }}>
            {tech.avatar}
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#111827", mb: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {tech.nom}
        </Typography>
        {tech.competences && (
          <Typography sx={{ fontSize: "10px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "5px" }}>
            {tech.competences.join(" · ")}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: "6px" }}>
          <Box sx={{ backgroundColor: `${loadColor}18`, borderRadius: "6px", padding: "2px 7px" }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: loadColor }}>{assigned} actifs</Typography>
          </Box>
          <Box sx={{ backgroundColor: "#F0FDF4", borderRadius: "6px", padding: "2px 7px" }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#22C55E" }}>{resolved} résolus</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 800, color: loadColor, flexShrink: 0 }}>{pct}%</Typography>
    </Box>
  );
}