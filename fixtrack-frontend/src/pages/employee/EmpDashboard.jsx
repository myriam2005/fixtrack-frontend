// src/pages/employee/EmpDashboard.jsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

// ─── Icônes SVG inline ────────────────────────────────────────
const Icon = {
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  arrowRight: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  filter: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  wave: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
};

// ─── Config statuts ───────────────────────────────────────────
const STATUS_CONFIG = {
  open:        { label: "Ouvert",   color: "#3B82F6", step: 1 },
  assigned:    { label: "Assigné",  color: "#8B5CF6", step: 2 },
  in_progress: { label: "En cours", color: "#F59E0B", step: 3 },
  resolved:    { label: "Résolu",   color: "#22C55E", step: 4 },
  closed:      { label: "Clôturé",  color: "#6B7280", step: 4 },
};

const PRIORITY_BORDER = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#D1D5DB",
};

const FILTER_TABS = [
  { key: "all",         label: "Tous" },
  { key: "open",        label: "Ouverts" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus" },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

// ─── Mini tracker de statut ───────────────────────────────────
function StatusTracker({ statut }) {
  const steps = [
    { key: "open",        label: "Ouvert" },
    { key: "in_progress", label: "En cours" },
    { key: "resolved",    label: "Résolu" },
  ];

  const visualStep =
    statut === "closed" || statut === "resolved"             ? 3 :
    statut === "in_progress" || statut === "assigned"        ? 2 : 1;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, mt: "5px" }}>
      {steps.map((step, i) => {
        const done    = i + 1 <= visualStep;
        const current = i + 1 === visualStep;
        return (
          <Box key={step.key} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{
              width: current ? 10 : 7,
              height: current ? 10 : 7,
              borderRadius: "50%",
              backgroundColor: done ? (current ? "#2563EB" : "#93C5FD") : "#E5E7EB",
              border: current ? "2px solid #DBEAFE" : "none",
              boxShadow: current ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
              transition: "all 0.2s",
              flexShrink: 0,
            }} />
            {i < steps.length - 1 && (
              <Box sx={{
                width: 22, height: 2, mx: "2px",
                backgroundColor: i + 1 < visualStep ? "#93C5FD" : "#E5E7EB",
                borderRadius: 1,
              }} />
            )}
          </Box>
        );
      })}
      <Typography sx={{
        ml: "7px", fontSize: "11px", fontWeight: 600,
        color: STATUS_CONFIG[statut]?.color || "#6B7280",
      }}>
        {STATUS_CONFIG[statut]?.label || statut}
      </Typography>
    </Box>
  );
}

// ─── Carte KPI ────────────────────────────────────────────────
function KpiCard({ icon, label, count, color, bgColor, description }) {
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
      <Box sx={{ position: "absolute", top: -28, right: -28, width: 90, height: 90, borderRadius: "50%", backgroundColor: bgColor, opacity: 0.7 }} />
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${color}66)` }} />

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
        <Box sx={{ width: 42, height: 42, borderRadius: "11px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Ligne ticket ─────────────────────────────────────────────
function TicketRow({ ticket, isLast }) {
  return (
    <>
      <Box sx={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "13px 18px 13px 16px",
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        transition: "background 0.15s, padding-left 0.15s",
        "&:hover": { backgroundColor: "#F8FAFF", paddingLeft: "20px" },
      }}>
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB",
          boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22`,
        }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "2px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "4px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {Icon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {Icon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.localisation}
              </Typography>
            </Box>
          </Box>
          <StatusTracker statut={ticket.statut} />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Badge status={ticket.statut} />
        </Box>

        <Link to={`/tickets/${ticket.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: "4px",
            color: "#2563EB", fontSize: "12px", fontWeight: 600,
            padding: "5px 11px", borderRadius: "7px",
            border: "1px solid #DBEAFE", backgroundColor: "#F0F7FF",
            transition: "all 0.15s",
            "&:hover": { backgroundColor: "#2563EB", color: "#FFFFFF", borderColor: "#2563EB" },
          }}>
            Voir détails {Icon.arrowRight}
          </Box>
        </Link>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function EmpDashboard() {
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const mockUser = useMemo(
    () => users.find((u) => u.email === authUser?.email) ?? users[0],
    [authUser?.email]
  );

  const myTickets = useMemo(
    () => tickets.filter((t) => t.auteurId === mockUser.id),
    [mockUser.id]
  );

  const openCount       = myTickets.filter((t) => t.statut === "open").length;
  const inProgressCount = myTickets.filter((t) => t.statut === "in_progress" || t.statut === "assigned").length;
  const resolvedCount   = myTickets.filter((t) => t.statut === "resolved" || t.statut === "closed").length;

  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter === "open")        return sorted.filter((t) => t.statut === "open");
    if (activeFilter === "in_progress") return sorted.filter((t) => t.statut === "in_progress" || t.statut === "assigned");
    if (activeFilter === "resolved")    return sorted.filter((t) => t.statut === "resolved" || t.statut === "closed");
    return sorted.slice(0, 5);
  }, [myTickets, activeFilter]);

  const firstName = (authUser?.name || mockUser.nom || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <Box sx={{ maxWidth: 1100, margin: "0 auto", pb: "80px" }}>

      {/* ════════════════════════════════════════════════════
          BOUTON NOUVEAU TICKET — FIXED (toujours visible)
      ════════════════════════════════════════════════════ */}
      <Link to="/employee/tickets/new" style={{ textDecoration: "none" }}>
        <Box sx={{
          position: "fixed",
          bottom: 28,
          right: 32,
          zIndex: 1400,                   // au dessus de tout (topbar = 1200)
          display: "flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          borderRadius: "14px",
          padding: "12px 22px",
          fontWeight: 700, fontSize: "14px",
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(37,99,235,0.45), 0 2px 6px rgba(0,0,0,0.15)",
          transition: "transform 0.15s, box-shadow 0.15s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 10px 28px rgba(37,99,235,0.55)",
          },
          "&:active": { transform: "translateY(0)" },
        }}>
          {Icon.plus}
          Nouveau ticket
        </Box>
      </Link>

      {/* ════════════════════════════════════════════════════
          HEADER — ultra compact, une seule ligne
      ════════════════════════════════════════════════════ */}
      <Box sx={{
        borderRadius: "12px",
        background: "linear-gradient(120deg, #1E3A5F 0%, #2563EB 100%)",
        padding: "14px 20px",           // ← padding réduit (était 32px)
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 14px rgba(37,99,235,0.20)",
        overflow: "hidden",
        position: "relative",
        minHeight: 0,                   // ← force la compacité
      }}>
        {/* Cercle déco minimaliste */}
        <Box sx={{ position: "absolute", top: -20, right: 40, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        {/* Gauche : icône + texte sur UNE ligne */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "9px",
            backgroundColor: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "#FCD34D",
          }}>
            {Icon.wave}
          </Box>
          <Box>
            <Typography sx={{
              fontSize: "15px", fontWeight: 800, color: "#FFFFFF",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {greeting}, {firstName} 👋
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", mt: "1px" }}>
              Voici vos activités de maintenance
            </Typography>
          </Box>
        </Box>

      </Box>

      {/* ── KPI Cards — grid grid-cols-3 gap-4 ── */}
      <Box
        className="grid grid-cols-3 gap-4"
        sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}
      >
        <KpiCard icon={Icon.ticket} label="Tickets ouverts"  count={openCount}        color="#3B82F6" bgColor="#EFF6FF" description="En attente de prise en charge" />
        <KpiCard icon={Icon.clock}  label="En cours"          count={inProgressCount}  color="#F59E0B" bgColor="#FFFBEB" description="Assignés ou en traitement" />
        <KpiCard icon={Icon.check}  label="Résolus ce mois"   count={resolvedCount}    color="#22C55E" bgColor="#F0FDF4" description="Tickets clôturés avec succès" />
      </Box>

      {/* ── Tableau tickets avec filtres ── */}
      <Paper elevation={0} sx={{
        borderRadius: "14px",
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        {/* En-tête + tabs */}
        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Mes tickets</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                {activeFilter !== "all" ? " filtrés" : " récents"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
              {Icon.filter}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Filtrer
              </Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: "4px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count =
                tab.key === "all"         ? myTickets.length :
                tab.key === "open"        ? openCount :
                tab.key === "in_progress" ? inProgressCount : resolvedCount;
              return (
                <Box key={tab.key} onClick={() => setActiveFilter(tab.key)} sx={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "7px 13px", cursor: "pointer",
                  borderRadius: "8px 8px 0 0",
                  borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                  backgroundColor: isActive ? "#F0F7FF" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" },
                }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280", transition: "color 0.15s" }}>
                    {tab.label}
                  </Typography>
                  <Box sx={{
                    backgroundColor: isActive ? "#2563EB" : "#E5E7EB",
                    color: isActive ? "#FFFFFF" : "#6B7280",
                    borderRadius: "20px", padding: "0 6px",
                    fontSize: "11px", fontWeight: 700, lineHeight: "18px", minWidth: "18px", textAlign: "center",
                    transition: "all 0.15s",
                  }}>
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Liste */}
        <Box sx={{ padding: "8px 6px 12px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "40px 24px" }}>
              <Box sx={{ fontSize: "34px", mb: "10px" }}>📋</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>
                Aucun ticket dans cette catégorie
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                Vos tickets apparaîtront ici dès leur création
              </Typography>
            </Box>
          ) : (
            filteredTickets.map((ticket, index) => (
              <TicketRow key={ticket.id} ticket={ticket} isLast={index === filteredTickets.length - 1} />
            ))
          )}
        </Box>

        {activeFilter === "all" && myTickets.length > 5 && (
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "12px 24px", textAlign: "center" }}>
            <Link to="/employee/tickets" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2563EB", "&:hover": { textDecoration: "underline" } }}>
                Voir tous mes tickets →
              </Typography>
            </Link>
          </Box>
        )}
      </Paper>

    </Box>
  );
}