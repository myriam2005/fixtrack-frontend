// src/pages/technician/Dashboard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { DashboardIcon, DashboardHeader, KpiCard } from "../../components/common/DashboardShared";
import { getGreeting, formatDate } from "../../components/common/DashboardSharedUtils";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

// ── Config priorités ──────────────────────────────────────────────────────────
const PRIORITY_BORDER = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#D1D5DB",
};

const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "assigned",    label: "Assignés" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatId = (id) => `FT-${id.replace(/\D/g, "").padStart(3, "0")}`;

const heuresDepuis = (dateStr) =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));

const estTermineAujourdhui = (ticket) => {
  if (!["resolved", "closed"].includes(ticket.statut)) return false;
  return new Date(ticket.dateCreation).toDateString() === new Date().toDateString();
};

// ── TicketRow ─────────────────────────────────────────────────────────────────
function TicketRow({ ticket, isLast, onNavigate }) {
  const isCriticalLate =
    ticket.priorite === "critical" &&
    !["resolved", "closed"].includes(ticket.statut) &&
    heuresDepuis(ticket.dateCreation) > 24;

  return (
    <>
      <Box sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: "10px", sm: "14px" },
        padding: { xs: "12px 12px 12px 10px", sm: "13px 18px 13px 16px" },
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        backgroundColor: isCriticalLate ? "#FFF8F8" : "transparent",
        transition: "background 0.15s, padding-left 0.15s",
        "&:hover": { backgroundColor: isCriticalLate ? "#FFF0F0" : "#F8FAFF", paddingLeft: { sm: "20px" } },
      }}>

        {/* Point priorité — masqué sur mobile */}
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          mt: { xs: "6px", sm: 0 },
          backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB",
          boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22`,
          display: { xs: "none", sm: "block" },
        }} />

        {/* Infos ticket */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Titre */}
          <Typography sx={{
            fontWeight: 600,
            fontSize: { xs: "13px", sm: "13.5px" },
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: "3px",
          }}>
            {ticket.titre}
          </Typography>

          {/* Meta — ID + date + lieu (desktop) */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: "8px", sm: "12px" },
            mb: "5px",
            flexWrap: "wrap",
          }}>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>
              {formatId(ticket.id)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                {formatDate(ticket.dateCreation)}
              </Typography>
            </Box>
            {/* Localisation inline — sm+ only */}
            {ticket.localisation && (
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: "3px" }}>
                {DashboardIcon.pin}
                <Typography sx={{
                  fontSize: "11px", color: "#9CA3AF",
                  maxWidth: { sm: 140, md: 200 },
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {ticket.localisation}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Badges */}
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
                {DashboardIcon.alertTriangle}
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  +24h — Intervention requise
                </Box>
              </Box>
            )}
          </Box>

          {/* Localisation — mobile only, below badges */}
          {ticket.localisation && (
            <Box sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center",
              gap: "3px",
              mt: "5px",
            }}>
              {DashboardIcon.pin}
              <Typography sx={{
                fontSize: "11px", color: "#9CA3AF",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "220px",
              }}>
                {ticket.localisation}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Voir détails → */}
        <Box
          onClick={() => onNavigate(ticket.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexShrink: 0,
            cursor: "pointer",
            color: "#2563EB",
            fontWeight: 600,
            whiteSpace: "nowrap",
            alignSelf: { xs: "flex-start", sm: "center" },
            mt: { xs: "2px", sm: 0 },
            transition: "all 0.15s",
            "&:hover": { color: "#1D4ED8", gap: "6px" },
          }}
        >
          {/* Text hidden on xs, shown on sm+ */}
          <Typography sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "inherit",
            display: { xs: "none", sm: "block" },
          }}>
            Voir détails
          </Typography>
          {DashboardIcon.arrowRight}
        </Box>

      </Box>

      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: { xs: "10px", sm: "18px" } }} />}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function TechnicianDashboard() {
  const navigate           = useNavigate();
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const mockUser = useMemo(
    () => users.find((u) => u.email === authUser?.email) ?? users.find((u) => u.role === "technician") ?? users[1],
    [authUser?.email]
  );

  const myTickets = useMemo(
    () => tickets.filter((t) => t.technicienId === mockUser?.id),
    [mockUser?.id]
  );

  const aFaireCount   = myTickets.filter(t => ["open", "assigned"].includes(t.statut)).length;
  const enCoursCount  = myTickets.filter(t => t.statut === "in_progress").length;
  const terminesCount = myTickets.filter(t => estTermineAujourdhui(t)).length;

  const alertesCritiques = useMemo(() =>
    myTickets.filter(t =>
      t.priorite === "critical" &&
      !["resolved", "closed"].includes(t.statut) &&
      heuresDepuis(t.dateCreation) > 24
    ), [myTickets]
  );

  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter === "assigned")    return sorted.filter(t => t.statut === "assigned");
    if (activeFilter === "in_progress") return sorted.filter(t => t.statut === "in_progress");
    if (activeFilter === "resolved")    return sorted.filter(t => ["resolved","closed"].includes(t.statut));
    return sorted.slice(0, 5);
  }, [myTickets, activeFilter]);

  const tabCounts = {
    all:         myTickets.length,
    assigned:    myTickets.filter(t => t.statut === "assigned").length,
    in_progress: enCoursCount,
    resolved:    myTickets.filter(t => ["resolved","closed"].includes(t.statut)).length,
  };

  const firstName = (authUser?.name || mockUser?.nom || "").split(" ")[0];
  const greeting  = getGreeting();

  if (!mockUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: "60px", sm: "80px" } }}>

      {/* ── Header ── */}
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        subtitle="Voici vos activités de maintenance"
      />

      {/* ── Alerte tickets critiques > 24h ── */}
      {alertesCritiques.length > 0 && (
        <Box sx={{
          borderRadius: "12px",
          backgroundColor: "#FEF2F2",
          border: "1.5px solid #FCA5A5",
          padding: { xs: "10px 14px", sm: "12px 18px" },
          marginBottom: "20px",
          animation: "pulseAlert 2.5s ease-in-out infinite",
          "@keyframes pulseAlert": {
            "0%,100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.25)" },
            "50%":      { boxShadow: "0 0 0 8px rgba(239,68,68,0)" },
          },
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "6px" }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: "#EF4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", flexShrink: 0,
            }}>
              {DashboardIcon.alertTriangle}
            </Box>
            <Typography sx={{ fontSize: { xs: "12px", sm: "13px" }, fontWeight: 700, color: "#EF4444" }}>
              {alertesCritiques.length} ticket{alertesCritiques.length > 1 ? "s" : ""} critique{alertesCritiques.length > 1 ? "s" : ""} non traité{alertesCritiques.length > 1 ? "s" : ""} depuis plus de 24h
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "11.5px", color: "#B91C1C", mb: "8px", ml: { xs: 0, sm: "36px" } }}>
            Intervention immédiate requise :
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", ml: { xs: 0, sm: "36px" } }}>
            {alertesCritiques.map(t => (
              <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#7F1D1D", flex: 1, minWidth: 0 }}>
                  <strong>{formatId(t.id)}</strong> — {t.titre}
                </Typography>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444", whiteSpace: "nowrap" }}>
                  {Math.floor(heuresDepuis(t.dateCreation) / 24)}j de retard
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── KPI Cards ── 1 col mobile / 3 col desktop ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: { xs: "10px", sm: "14px" },
        marginBottom: "20px",
      }}>
        <KpiCard
          icon={DashboardIcon.ticket}
          label="Tickets ouverts"
          count={aFaireCount}
          color="#3B82F6"
          bgColor="#EFF6FF"
          description="En attente de prise en charge"
        />
        <KpiCard
          icon={DashboardIcon.clock}
          label="En cours"
          count={enCoursCount}
          color="#F59E0B"
          bgColor="#FFFBEB"
          description="Assignés ou en traitement"
        />
        <KpiCard
          icon={DashboardIcon.check}
          label="Résolus ce mois"
          count={terminesCount}
          color="#22C55E"
          bgColor="#F0FDF4"
          description="Tickets clôturés avec succès"
        />
      </Box>

      {/* ── Tableau tickets ── */}
      <Paper elevation={0} sx={{
        borderRadius: "14px",
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>

        {/* Header tableau */}
        <Box sx={{
          padding: { xs: "12px 14px 0", sm: "16px 24px 0" },
          borderBottom: "1px solid #F3F4F6",
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "14px", sm: "15px" }, color: "#111827" }}>
                Mes tickets assignés
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                {activeFilter !== "all" ? " filtrés" : " récents"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
              {DashboardIcon.filter}
              <Typography sx={{
                fontSize: "11px", fontWeight: 600, color: "#9CA3AF",
                textTransform: "uppercase", letterSpacing: "0.06em",
                display: { xs: "none", sm: "block" },
              }}>
                Filtrer
              </Typography>
            </Box>
          </Box>

          {/* Onglets — scrollable horizontalement sur mobile */}
          <Box sx={{
            display: "flex",
            gap: { xs: "2px", sm: "4px" },
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            pb: "1px",
          }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tabCounts[tab.key] ?? 0;
              return (
                <Box
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: { xs: "6px 10px", sm: "7px 13px" },
                    cursor: "pointer",
                    borderRadius: "8px 8px 0 0",
                    borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                    backgroundColor: isActive ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s",
                    flexShrink: 0,
                    "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" },
                  }}
                >
                  <Typography sx={{
                    fontSize: { xs: "12px", sm: "13px" },
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#2563EB" : "#6B7280",
                    whiteSpace: "nowrap",
                  }}>
                    {tab.label}
                  </Typography>
                  <Box sx={{
                    backgroundColor: isActive ? "#2563EB" : "#E5E7EB",
                    color: isActive ? "#FFFFFF" : "#6B7280",
                    borderRadius: "20px",
                    padding: "0 6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    lineHeight: "18px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}>
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Liste des tickets */}
        <Box sx={{ padding: { xs: "6px 4px 10px", sm: "8px 6px 12px" } }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: { xs: "28px 16px", sm: "40px 24px" } }}>
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

        {/* Lien voir tous */}
        {activeFilter === "all" && myTickets.length > 2 && (
          <Box sx={{
            borderTop: "1px solid #F3F4F6",
            padding: { xs: "10px 16px", sm: "12px 24px" },
            textAlign: "center",
          }}>
            <Box onClick={() => navigate("/technician/tickets")} sx={{ cursor: "pointer", display: "inline-block" }}>
              <Typography sx={{
                fontSize: { xs: "12px", sm: "13px" },
                fontWeight: 600,
                color: "#2563EB",
                "&:hover": { textDecoration: "underline" },
              }}>
                Voir tous mes tickets assignés →
              </Typography>
            </Box>
          </Box>
        )}

      </Paper>
    </Box>
  );
}