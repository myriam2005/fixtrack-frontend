// src/pages/technician/Dashboard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

// ── Icônes (même structure que EmpDashboard) ─────────────────────────────────
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
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
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
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

// ── Config statuts / priorités (même que EmpDashboard) ───────────────────────
const STATUS_CONFIG = {
  open:        { label: "Ouvert",   color: "#3B82F6" },
  assigned:    { label: "Assigné",  color: "#8B5CF6" },
  in_progress: { label: "En cours", color: "#F59E0B" },
  resolved:    { label: "Résolu",   color: "#22C55E" },
  closed:      { label: "Clôturé",  color: "#6B7280" },
};

const PRIORITY_BORDER = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#D1D5DB",
};

// Onglets — identiques à EmpDashboard + "Assignés"
const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "assigned",    label: "Assignés" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatId = (id) => `FT-${id.replace(/\D/g, "").padStart(3, "0")}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const heuresDepuis = (dateStr) =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));

const estTermineAujourdhui = (ticket) => {
  if (!["resolved", "closed"].includes(ticket.statut)) return false;
  return new Date(ticket.dateCreation).toDateString() === new Date().toDateString();
};

// ── KpiCard — réutilisé identique à EmpDashboard ────────────────────────────
function KpiCard({ icon, label, count, color, bgColor, description }) {
  return (
    <Paper elevation={0} sx={{
      borderRadius: "14px", padding: "20px 22px",
      border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
    }}>
      {/* Cercle décoratif */}
      <Box sx={{ position: "absolute", top: -28, right: -28, width: 90, height: 90, borderRadius: "50%", backgroundColor: bgColor, opacity: 0.7 }} />
      {/* Barre colorée en bas */}
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

// ── TicketRow — adapté pour technicien (flèche + alerte critique) ─────────────
function TicketRow({ ticket, isLast, onNavigate }) {
  const isCriticalLate =
    ticket.priorite === "critical" &&
    !["resolved", "closed"].includes(ticket.statut) &&
    heuresDepuis(ticket.dateCreation) > 24;

  return (
    <>
      <Box sx={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "13px 18px 13px 16px",
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        backgroundColor: isCriticalLate ? "#FFF8F8" : "transparent",
        transition: "background 0.15s, padding-left 0.15s",
        "&:hover": { backgroundColor: isCriticalLate ? "#FFF0F0" : "#F8FAFF", paddingLeft: "20px" },
      }}>
        {/* Point priorité */}
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB",
          boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22`,
        }} />

        {/* Infos ticket */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Titre */}
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "2px" }}>
            {ticket.titre}
          </Typography>

          {/* Meta — ID + date + lieu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "4px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>
              {formatId(ticket.id)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {Icon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            {ticket.localisation && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                {Icon.pin}
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticket.localisation}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Badges statut + catégorie + alerte inline */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <Badge status={ticket.statut} />
            <Badge status={ticket.priorite} />
            {isCriticalLate && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", fontWeight: 700, color: "#EF4444",
                backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5",
                borderRadius: "999px", padding: "2px 8px",
                animation: "pulseAlert 2s ease-in-out infinite",
              }}>
                {Icon.alert}
                +24h — Intervention requise
              </Box>
            )}
          </Box>
        </Box>

        {/* Flèche → page ticket assigné */}
        <Box
          onClick={() => onNavigate(ticket.id)}
          sx={{
            width: 30, height: 30, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "8px", border: "1.5px solid #E5E7EB",
            color: "#9CA3AF", cursor: "pointer",
            transition: "all 0.15s",
            "&:hover": {
              backgroundColor: "#2563EB", borderColor: "#2563EB",
              color: "#FFFFFF", transform: "translateX(2px)",
            },
          }}
        >
          {Icon.arrowRight}
        </Box>
      </Box>

      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function TechnicianDashboard() {
  const navigate          = useNavigate();
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const mockUser = useMemo(
    () => users.find((u) => u.email === authUser?.email) ?? users.find((u) => u.role === "technician") ?? users[1],
    [authUser?.email]
  );

  // Tickets assignés à ce technicien
  const myTickets = useMemo(
    () => tickets.filter((t) => t.technicienId === mockUser?.id),
    [mockUser?.id]
  );

  // ── Statistiques ──────────────────────────────────────
  const aFaireCount   = myTickets.filter(t => ["open", "assigned"].includes(t.statut)).length;
  const enCoursCount  = myTickets.filter(t => t.statut === "in_progress").length;
  const terminesCount = myTickets.filter(t => estTermineAujourdhui(t)).length;

  // ── Tickets critiques non traités > 24h ───────────────
  const alertesCritiques = useMemo(() =>
    myTickets.filter(t =>
      t.priorite === "critical" &&
      !["resolved", "closed"].includes(t.statut) &&
      heuresDepuis(t.dateCreation) > 24
    ), [myTickets]
  );

  // ── Tickets filtrés + triés ───────────────────────────
  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter === "assigned")    return sorted.filter(t => t.statut === "assigned");
    if (activeFilter === "in_progress") return sorted.filter(t => t.statut === "in_progress");
    if (activeFilter === "resolved")    return sorted.filter(t => ["resolved","closed"].includes(t.statut));
    return sorted.slice(0, 5);
  }, [myTickets, activeFilter]);

  // Compteurs par onglet
  const tabCounts = {
    all:         myTickets.length,
    assigned:    myTickets.filter(t => t.statut === "assigned").length,
    in_progress: enCoursCount,
    resolved:    myTickets.filter(t => ["resolved","closed"].includes(t.statut)).length,
  };

  // Salutation dynamique
  const firstName = (authUser?.name || mockUser?.nom || "").split(" ")[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  if (!mockUser) {
    return (
      <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: "80px" }}>

      {/* ════════════════════════════════════════════
          BARRE DE BIENVENUE — identique à EmpDashboard
          ════════════════════════════════════════════ */}
      <Box sx={{
        borderRadius: "12px",
        background: "linear-gradient(120deg, #1E3A5F 0%, #2563EB 100%)",
        padding: "14px 20px", marginBottom: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 3px 14px rgba(37,99,235,0.20)",
        overflow: "hidden", position: "relative",
      }}>
        {/* Cercle décoratif */}
        <Box sx={{ position: "absolute", top: -20, right: 40, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
          {/* Icône wave */}
          <Box sx={{ width: 34, height: 34, borderRadius: "9px", backgroundColor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FCD34D" }}>
            {Icon.wave}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {greeting}, {firstName} 👋
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", mt: "1px" }}>
              Voici vos activités de maintenance
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ════════════════════════════════════════════
          ALERTE TICKETS CRITIQUES > 24H
          ════════════════════════════════════════════ */}
      {alertesCritiques.length > 0 && (
        <Box sx={{
          borderRadius: "12px",
          backgroundColor: "#FEF2F2",
          border: "1.5px solid #FCA5A5",
          padding: "12px 18px",
          marginBottom: "20px",
          animation: "pulseAlert 2.5s ease-in-out infinite",
          "@keyframes pulseAlert": {
            "0%,100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.25)" },
            "50%":      { boxShadow: "0 0 0 8px rgba(239,68,68,0)" },
          },
        }}>
          {/* Titre alerte */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "6px" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              {Icon.alert}
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
              {alertesCritiques.length} ticket{alertesCritiques.length > 1 ? "s" : ""} critique{alertesCritiques.length > 1 ? "s" : ""} non traité{alertesCritiques.length > 1 ? "s" : ""} depuis plus de 24h
            </Typography>
          </Box>

          {/* Sous-titre */}
          <Typography sx={{ fontSize: "11.5px", color: "#B91C1C", mb: "8px", ml: "36px" }}>
            Intervention immédiate requise :
          </Typography>

          {/* Liste des tickets en retard */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", ml: "36px" }}>
            {alertesCritiques.map(t => (
              <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#7F1D1D" }}>
                  <strong>{formatId(t.id)}</strong> — {t.titre}
                </Typography>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444", ml: "auto", whiteSpace: "nowrap" }}>
                  {Math.floor(heuresDepuis(t.dateCreation) / 24)}j de retard
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ════════════════════════════════════════════
          KPI CARDS — identiques à EmpDashboard
          ════════════════════════════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        <KpiCard icon={Icon.ticket} label="Tickets ouverts"  count={aFaireCount}   color="#3B82F6" bgColor="#EFF6FF" description="En attente de prise en charge" />
        <KpiCard icon={Icon.clock}  label="En cours"         count={enCoursCount}  color="#F59E0B" bgColor="#FFFBEB" description="Assignés ou en traitement" />
        <KpiCard icon={Icon.check}  label="Résolus ce mois"  count={terminesCount} color="#22C55E" bgColor="#F0FDF4" description="Tickets clôturés avec succès" />
      </Box>

      {/* ════════════════════════════════════════════
          TABLEAU TICKETS — même structure que EmpDashboard
          ════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>

        {/* Header */}
        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Mes tickets assignés</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}{activeFilter !== "all" ? " filtrés" : " récents"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
              {Icon.filter}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filtrer</Typography>
            </Box>
          </Box>

          {/* Onglets filtres */}
          <Box sx={{ display: "flex", gap: "4px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tabCounts[tab.key] ?? 0;
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
                  <Typography sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280" }}>
                    {tab.label}
                  </Typography>
                  <Box sx={{ backgroundColor: isActive ? "#2563EB" : "#E5E7EB", color: isActive ? "#FFFFFF" : "#6B7280", borderRadius: "20px", padding: "0 6px", fontSize: "11px", fontWeight: 700, lineHeight: "18px", minWidth: "18px", textAlign: "center" }}>
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Liste des tickets */}
        <Box sx={{ padding: "8px 6px 12px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "40px 24px" }}>
              <Box sx={{ fontSize: "34px", mb: "10px" }}>🔧</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>
                Aucun ticket dans cette catégorie
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                Vos tickets assignés apparaîtront ici
              </Typography>
            </Box>
          ) : (
            filteredTickets.map((ticket, index) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isLast={index === filteredTickets.length - 1}
                onNavigate={(id) => navigate(`/technician/ticket/${id}`)}
              />
            ))
          )}
        </Box>

        {/* Lien "Voir tous mes tickets" */}
        {activeFilter === "all" && myTickets.length > 2 && (
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "12px 24px", textAlign: "center" }}>
            <Box
              onClick={() => navigate("/technician/tickets")}
              sx={{ cursor: "pointer", display: "inline-block" }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2563EB", "&:hover": { textDecoration: "underline" } }}>
                Voir tous mes tickets assignés →
              </Typography>
            </Box>
          </Box>
        )}

      </Paper>
    </Box>
  );
}