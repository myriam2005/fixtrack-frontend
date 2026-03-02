// src/pages/technician/Dashboard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  DashboardHeader,
  KpiCard,
  DashboardIcon,
  getGreeting,
  formatDate,
} from "../../components/common/DashboardShared";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import styles from "./../employee/MyTickets.module.css";

// ── Icônes locales (non disponibles dans DashboardShared) ─────────────────────
const Icon = {
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  bulb: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  lightning: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

// ── Config priorités / statuts ────────────────────────────────────────────────
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

const estTermineAujourdhui = (t) => {
  if (!["resolved", "closed"].includes(t.statut)) return false;
  return new Date(t.dateCreation).toDateString() === new Date().toDateString();
};

// Mois des 3 derniers mois
const getLast3Months = () => {
  const now = new Date();
  return [2, 1, 0].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      year:  d.getFullYear(),
      month: d.getMonth(),
    };
  });
};

// Conseils rotatifs pour le technicien
const CONSEILS = [
  "Commencez par les tickets critiques pour maximiser votre impact.",
  "Documentez vos interventions pour faciliter le suivi.",
  "Vérifiez les tickets assignés depuis plus de 24h en priorité.",
  "Une résolution rapide améliore la satisfaction des utilisateurs.",
  "Pensez à mettre à jour le statut en temps réel pour la visibilité.",
];

// ════════════════════════════════════════════════════════════
//  DonutChart — Répartition des statuts (canvas-free, SVG pur)
// ════════════════════════════════════════════════════════════
function DonutChart({ data, total }) {
  const SIZE = 110;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R  = 42;
  const STROKE = 14;
  const CIRC = 2 * Math.PI * R;

  let offset = 0;
  const slices = data.map((d) => {
    const pct   = total > 0 ? d.value / total : 0;
    const dash  = pct * CIRC;
    const gap   = CIRC - dash;
    const slice = { ...d, pct, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <Box sx={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
        {/* Fond */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={STROKE}/>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {/* Centre */}
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 900, color: "#111827", lineHeight: 1 }}>{total}</Typography>
        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</Typography>
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
//  MonthlyBarChart — Activité mensuelle (3 derniers mois)
// ════════════════════════════════════════════════════════════
function MonthlyBarChart({ myTickets, total }) {
  const months = getLast3Months();
  const counts = months.map(({ year, month }) =>
    myTickets.filter((t) => {
      const d = new Date(t.dateCreation);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );
  const max = Math.max(...counts, 1);
  const currentMonth = months[2].label;

  return (
    <Box sx={{ flex: 1 }}>
      {/* Barres */}
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "70px", mb: "8px" }}>
        {months.map((m, i) => {
          const isCurrent = m.label.toLowerCase() === currentMonth.toLowerCase();
          const pct = counts[i] / max;
          return (
            <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: isCurrent ? "#2563EB" : "#9CA3AF" }}>
                {counts[i] > 0 ? counts[i] : ""}
              </Typography>
              <Box sx={{ width: "100%", height: `${Math.max(pct * 54, 4)}px`, borderRadius: "4px 4px 0 0", background: isCurrent ? "linear-gradient(180deg,#3B82F6,#2563EB)" : "#E5E7EB", transition: "height 0.4s ease" }}/>
            </Box>
          );
        })}
      </Box>
      {/* Labels mois */}
      <Box sx={{ display: "flex", gap: "12px" }}>
        {months.map((m, i) => {
          const isCurrent = i === 2;
          return (
            <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
              <Typography sx={{ fontSize: "11px", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#2563EB" : "#9CA3AF", textTransform: "capitalize" }}>
                {m.label.replace(".", "")}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
//  TicketRow
// ════════════════════════════════════════════════════════════
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
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB", boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22` }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "2px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "4px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>
              {formatId(ticket.id)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            {ticket.localisation && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                {DashboardIcon.pin}
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticket.localisation}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <Badge status={ticket.statut} />
            <Badge status={ticket.priorite} />
            {isCriticalLate && (
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#EF4444", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "999px", padding: "2px 8px" }}>
                {Icon.alert} +24h — Intervention requise
              </Box>
            )}
          </Box>
        </Box>

        {/* Bouton Voir détails */}
        <button className={styles.detailBtn} onClick={() => onNavigate(ticket.id)}>
          Voir détails
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
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

  // ── Stats ──────────────────────────────────────────────────
  const aFaireCount   = myTickets.filter(t => ["open","assigned"].includes(t.statut)).length;
  const enCoursCount  = myTickets.filter(t => t.statut === "in_progress").length;
  const terminesCount = myTickets.filter(t => estTermineAujourdhui(t)).length;
  const resolusCount  = myTickets.filter(t => ["resolved","closed"].includes(t.statut)).length;

  // ── Donut data ─────────────────────────────────────────────
  const donutData = [
    { label: "Ouverts",  value: aFaireCount,  color: "#3B82F6" },
    { label: "En cours", value: enCoursCount,  color: "#F59E0B" },
    { label: "Résolus",  value: resolusCount,  color: "#22C55E" },
  ];
  const donutTotal = myTickets.length;

  // ── Alerte critique ────────────────────────────────────────
  const alertesCritiques = useMemo(() =>
    myTickets.filter(t =>
      t.priorite === "critical" &&
      !["resolved","closed"].includes(t.statut) &&
      heuresDepuis(t.dateCreation) > 24
    ), [myTickets]
  );

  // ── Tickets filtrés ────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter === "assigned")    return sorted.filter(t => t.statut === "assigned");
    if (activeFilter === "in_progress") return sorted.filter(t => t.statut === "in_progress");
    if (activeFilter === "resolved")    return sorted.filter(t => ["resolved","closed"].includes(t.statut));
    return sorted.slice(0, 4);
  }, [myTickets, activeFilter]);

  const tabCounts = {
    all:         myTickets.length,
    assigned:    myTickets.filter(t => t.statut === "assigned").length,
    in_progress: enCoursCount,
    resolved:    resolusCount,
  };

  // Conseil du jour (index selon jour de la semaine)
  const conseil = CONSEILS[new Date().getDay() % CONSEILS.length];

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
    <Box sx={{ pb: "80px" }}>

      {/* ════════════════════════════════════════════
          BARRE DE BIENVENUE — DashboardShared
          ════════════════════════════════════════════ */}
      <DashboardHeader
        firstName={firstName}
        greeting={greeting}
        subtitle="Voici vos activités de maintenance"
      />

      {/* ════════════════════════════════════════════
          ALERTE CRITIQUE > 24H
          ════════════════════════════════════════════ */}
      {alertesCritiques.length > 0 && (
        <Box sx={{
          borderRadius: "12px", backgroundColor: "#FEF2F2",
          border: "1.5px solid #FCA5A5", padding: "12px 18px", marginBottom: "20px",
          "@keyframes pulseAlert": {
            "0%,100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.25)" },
            "50%":      { boxShadow: "0 0 0 8px rgba(239,68,68,0)" },
          },
          animation: "pulseAlert 2.5s ease-in-out infinite",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "6px" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              {Icon.alert}
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
              {alertesCritiques.length} ticket{alertesCritiques.length > 1 ? "s" : ""} critique{alertesCritiques.length > 1 ? "s" : ""} non traité{alertesCritiques.length > 1 ? "s" : ""} depuis plus de 24h
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "11.5px", color: "#B91C1C", mb: "8px", ml: "36px" }}>
            Intervention immédiate requise :
          </Typography>
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
          KPI CARDS — KpiCard de DashboardShared
          ════════════════════════════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        <KpiCard icon={DashboardIcon.ticket} label="Tickets ouverts"  count={aFaireCount}   color="#3B82F6" bgColor="#EFF6FF" description="En attente de prise en charge" />
        <KpiCard icon={DashboardIcon.clock}  label="En cours"         count={enCoursCount}  color="#F59E0B" bgColor="#FFFBEB" description="Assignés ou en traitement" />
        <KpiCard icon={DashboardIcon.check}  label="Résolus ce mois"  count={terminesCount} color="#22C55E" bgColor="#F0FDF4" description="Tickets clôturés avec succès" />
      </Box>

      {/* ════════════════════════════════════════════
          GRAPHIQUES — 3 colonnes (comme la capture)
          ════════════════════════════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>

        {/* ── 1. Répartition des statuts (Donut) ── */}
        <Paper elevation={0} sx={{ borderRadius: "14px", padding: "18px 20px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "14px" }}>
            Répartition des statuts
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* SVG Donut */}
            <DonutChart data={donutData} total={donutTotal} />
            {/* Légende */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {donutData.map((d) => {
                const pct = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0;
                return (
                  <Box key={d.label}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "3px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: d.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "11px", color: "#374151", fontWeight: 500 }}>{d.label}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827" }}>{d.value}</Typography>
                        <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>· {pct}%</Typography>
                      </Box>
                    </Box>
                    {/* Barre de progression */}
                    <Box sx={{ height: "4px", backgroundColor: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${pct}%`, backgroundColor: d.color, borderRadius: "999px", transition: "width 0.6s ease" }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>

        {/* ── 2. Activité mensuelle (Barres) ── */}
        <Paper elevation={0} sx={{ borderRadius: "14px", padding: "18px 20px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Activité mensuelle
            </Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#EFF6FF", color: "#2563EB", borderRadius: "999px", padding: "3px 9px" }}>
              <Box sx={{ color: "#2563EB", display: "flex" }}>{Icon.lightning}</Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>
                {donutTotal} total
              </Typography>
            </Box>
          </Box>
          <MonthlyBarChart myTickets={myTickets} total={donutTotal} />
        </Paper>

        {/* ── 3. Conseil du jour ── */}
        <Paper elevation={0} sx={{ borderRadius: "14px", padding: "18px 20px", border: "1px solid #FDE68A", backgroundColor: "#FFFBEB", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "8px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", flexShrink: 0 }}>
              {Icon.bulb}
            </Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Conseil du jour
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "13px", color: "#78350F", lineHeight: 1.6 }}>
            {conseil}
          </Typography>
          {/* Séparateur */}
          <Box sx={{ height: "1px", backgroundColor: "#FDE68A", my: "12px" }} />
          {/* Stat rapide */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "10px", color: "#92400E", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Taux de résolution</Typography>
              <Typography sx={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: 1.2 }}>
                {donutTotal > 0 ? Math.round((resolusCount / donutTotal) * 100) : 0}%
              </Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
              {DashboardIcon.check}
            </Box>
          </Box>
        </Paper>

      </Box>

      {/* ════════════════════════════════════════════
          TABLEAU TICKETS
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
              {DashboardIcon.filter}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filtrer</Typography>
            </Box>
          </Box>

          {/* Onglets */}
          <Box sx={{ display: "flex", gap: "4px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tabCounts[tab.key] ?? 0;
              return (
                <Box key={tab.key} onClick={() => setActiveFilter(tab.key)} sx={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 13px", cursor: "pointer", borderRadius: "8px 8px 0 0", borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent", backgroundColor: isActive ? "#F0F7FF" : "transparent", transition: "all 0.15s", "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" } }}>
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

        {/* Liste */}
        <Box sx={{ padding: "8px 6px 12px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "40px 24px" }}>
              <Box sx={{ fontSize: "34px", mb: "10px" }}>🔧</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>Aucun ticket dans cette catégorie</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Vos tickets assignés apparaîtront ici</Typography>
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

        {/* Lien Voir tout — toujours visible */}
        <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "12px 24px", textAlign: "center" }}>
          <Box onClick={() => navigate("/technician/tickets")} sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2563EB", "&:hover": { textDecoration: "underline" } }}>
              Voir tous mes tickets assignés
            </Typography>
            <Box sx={{ color: "#2563EB", display: "flex", alignItems: "center" }}>
              {DashboardIcon.arrowRight}
            </Box>
          </Box>
        </Box>

      </Paper>
    </Box>
  );
}