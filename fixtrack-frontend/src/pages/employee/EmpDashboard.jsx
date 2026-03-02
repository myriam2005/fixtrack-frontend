// src/pages/employee/EmpDashboard.jsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Badge from "../../components/common/Badge";
import {
  DashboardHeader,
  KpiCard,
  DashboardIcon,
  getGreeting,
  formatDate,
} from "../../components/common/DashboardShared";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

// ── Config locale ──────────────────────────────────────────────────────────────

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

const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "open",        label: "Ouverts"  },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
];

const DAILY_TIPS = [
  "Décrivez précisément la localisation et les symptômes du problème pour accélérer l'intervention du technicien.",
  "Un ticket bien documenté avec des photos réduit le délai de résolution de 40% en moyenne.",
  "Pensez à vérifier le statut de vos tickets régulièrement pour rester informé de leur avancement.",
  "Indiquez toujours votre numéro de téléphone pour permettre au technicien de vous contacter rapidement.",
  "Classez votre ticket avec la bonne priorité : réservez « Critique » aux urgences réelles (risque de sécurité, arrêt total).",
];

// ── Icône locale (lightbulb) ───────────────────────────────────────────────────
const lightbulbIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" /><path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const zapIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ── MiniBarChart (local — spécifique EmpDashboard) ────────────────────────────
function MiniBarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const currentMonth = new Date().getMonth();

  const visibleData = data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  const visibleStart = Math.max(0, currentMonth - 5);

  return (
    <Box sx={{ mt: "14px" }}>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "5px", height: 64, position: "relative" }}>
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <Box key={level} sx={{
            position: "absolute", left: 0, right: 0,
            bottom: `${level * 100}%`, height: "1px",
            backgroundColor: "#F3F4F6", pointerEvents: "none",
          }} />
        ))}
        {visibleData.map((item, localIdx) => {
          const i = visibleStart + localIdx;
          const pct = max === 0 ? 0 : (item.value / max) * 100;
          const isCurrent = i === currentMonth;
          const isHovered = hovered === i;
          const barHeight = Math.max(pct, 5);
          return (
            <Box
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", position: "relative" }}
            >
              {isHovered && (
                <Box sx={{
                  position: "absolute", bottom: "calc(100% + 6px)",
                  left: "50%", transform: "translateX(-50%)",
                  backgroundColor: "#111827", color: "#FFFFFF",
                  borderRadius: "6px", padding: "4px 8px",
                  fontSize: "11px", fontWeight: 700,
                  whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  "&::after": {
                    content: '""', position: "absolute", top: "100%",
                    left: "50%", transform: "translateX(-50%)",
                    border: "4px solid transparent", borderTopColor: "#111827",
                  },
                }}>
                  {item.value} ticket{item.value !== 1 ? "s" : ""}
                </Box>
              )}
              <Box sx={{
                width: "100%", height: `${barHeight}%`, minHeight: 4,
                borderRadius: "4px 4px 3px 3px",
                background: isCurrent
                  ? "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)"
                  : isHovered
                    ? "linear-gradient(180deg, #93C5FD 0%, #BFDBFE 100%)"
                    : "#DBEAFE",
                boxShadow: isCurrent ? "0 2px 8px rgba(37,99,235,0.35)" : "none",
                transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
                transform: isHovered ? "scaleY(1.04)" : "scaleY(1)",
                transformOrigin: "bottom",
                cursor: "default",
              }} />
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", gap: "5px", mt: "5px" }}>
        {visibleData.map((_, localIdx) => {
          const i = visibleStart + localIdx;
          const isCurrent = i === currentMonth;
          return (
            <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
              <Typography sx={{
                fontSize: "9px",
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? "#2563EB" : "#9CA3AF",
                letterSpacing: "0.02em",
              }}>
                {MONTHS[i]}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── DonutChart (local — spécifique EmpDashboard) ──────────────────────────────
function DonutChart({ segments, total, size = 100 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const strokeWidth = 11;
  const gap = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const validSegments = segments.filter((s) => s.value > 0);
  const totalVal = validSegments.reduce((acc, s) => acc + s.value, 0) || 1;
  const gapFraction = gap / 360;
  const totalGapFraction = gapFraction * validSegments.length;
 const fractions = validSegments.map(
  (seg) => (seg.value / totalVal) * (1 - totalGapFraction)
);

const startFractions = fractions.reduce((acc, f, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + fractions[i - 1] + gapFraction);
  return acc;
}, []);

const rendered = validSegments.map((seg, i) => {
  const fraction = fractions[i];
  const dashLen = fraction * circumference;
  const startOffset = circumference - startFractions[i] * circumference;
  const isHov = hoveredIdx === i;
  return { seg, dashLen, startOffset, isHov };
});

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        {rendered.map(({ seg, dashLen, startOffset, isHov }, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={isHov ? strokeWidth + 2.5 : strokeWidth}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={startOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-width 0.2s ease, opacity 0.2s ease",
              opacity: hoveredIdx !== null && !isHov ? 0.45 : 1,
              cursor: "pointer",
              filter: isHov ? `drop-shadow(0 0 4px ${seg.color}88)` : "none",
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </svg>
      <Box sx={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        pointerEvents: "none",
      }}>
        {hoveredIdx !== null ? (
          <>
            <Typography sx={{ fontSize: "17px", fontWeight: 900, color: rendered[hoveredIdx]?.seg.color, lineHeight: 1, transition: "color 0.2s" }}>
              {rendered[hoveredIdx]?.seg.value}
            </Typography>
            <Typography sx={{ fontSize: "8px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mt: "1px" }}>
              tickets
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: "19px", fontWeight: 900, color: "#111827", lineHeight: 1 }}>{total}</Typography>
            <Typography sx={{ fontSize: "8px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mt: "1px" }}>total</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

// ── Sous-composants locaux ─────────────────────────────────────────────────────

function StatusTracker({ statut }) {
  const steps = [{ key: "open" }, { key: "in_progress" }, { key: "resolved" }];
  const visualStep =
    statut === "closed" || statut === "resolved"      ? 3 :
    statut === "in_progress" || statut === "assigned" ? 2 : 1;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, mt: "5px" }}>
      {steps.map((step, i) => {
        const done    = i + 1 <= visualStep;
        const current = i + 1 === visualStep;
        return (
          <Box key={step.key} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{
              width: current ? 10 : 7, height: current ? 10 : 7, borderRadius: "50%",
              backgroundColor: done ? (current ? "#2563EB" : "#93C5FD") : "#E5E7EB",
              border: current ? "2px solid #DBEAFE" : "none",
              boxShadow: current ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
              transition: "all 0.2s", flexShrink: 0,
            }} />
            {i < steps.length - 1 && (
              <Box sx={{ width: 22, height: 2, mx: "2px", backgroundColor: i + 1 < visualStep ? "#93C5FD" : "#E5E7EB", borderRadius: 1 }} />
            )}
          </Box>
        );
      })}
      <Typography sx={{ ml: "7px", fontSize: "11px", fontWeight: 600, color: STATUS_CONFIG[statut]?.color || "#6B7280" }}>
        {STATUS_CONFIG[statut]?.label || statut}
      </Typography>
    </Box>
  );
}

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
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.localisation}
              </Typography>
            </Box>
          </Box>
          <StatusTracker statut={ticket.statut} />
        </Box>
        <Box sx={{ flexShrink: 0 }}><Badge status={ticket.statut} /></Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

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

  const totalCount      = myTickets.length;
  const openCount       = myTickets.filter((t) => t.statut === "open").length;
  const inProgressCount = myTickets.filter((t) => t.statut === "in_progress" || t.statut === "assigned").length;
  const resolvedCount   = myTickets.filter((t) => t.statut === "resolved" || t.statut === "closed").length;

  const pctOpen       = totalCount > 0 ? Math.round((openCount / totalCount) * 100) : 0;
  const pctInProgress = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const pctResolved   = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const donutSegments = [
    { value: openCount,       color: "#3B82F6" },
    { value: inProgressCount, color: "#F59E0B" },
    { value: resolvedCount,   color: "#22C55E" },
  ].filter((s) => s.value > 0);

  const monthlyData = useMemo(() => {
    const counts = Array(12).fill(0);
    myTickets.forEach((t) => {
      const m = new Date(t.dateCreation).getMonth();
      counts[m] += 1;
    });
    return counts.map((value, i) => ({ month: i, value }));
  }, [myTickets]);

  const todayTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter === "open")        return sorted.filter((t) => t.statut === "open");
    if (activeFilter === "in_progress") return sorted.filter((t) => t.statut === "in_progress" || t.statut === "assigned");
    if (activeFilter === "resolved")    return sorted.filter((t) => t.statut === "resolved" || t.statut === "closed");
    return sorted.slice(0, 5);
  }, [myTickets, activeFilter]);

  const firstName = (authUser?.name || mockUser.nom || "").split(" ")[0];

  return (
    <Box sx={{ pb: "80px" }}>

      {/* ── Header ── */}
      <DashboardHeader
        firstName={firstName}
        greeting={getGreeting()}
        subtitle="Voici vos activités de maintenance"
      />

      {/* ── KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        <KpiCard
          icon={DashboardIcon.ticket}
          label="Tickets ouverts"
          count={openCount}
          color="#3B82F6"
          bgColor="#EFF6FF"
          description="En attente de prise en charge"
        />
        <KpiCard
          icon={DashboardIcon.clock}
          label="En cours"
          count={inProgressCount}
          color="#F59E0B"
          bgColor="#FFFBEB"
          description="Assignés ou en traitement"
        />
        <KpiCard
          icon={DashboardIcon.check}
          label="Résolus ce mois"
          count={resolvedCount}
          color="#22C55E"
          bgColor="#F0FDF4"
          description="Tickets clôturés avec succès"
        />
      </Box>

      {/* ── Analytics Row ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", mb: "22px" }}>

        {/* Donut — Répartition des statuts */}
        <Paper elevation={0} sx={{ borderRadius: "16px", padding: "20px 22px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "16px" }}>
            Répartition des statuts
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <DonutChart
              segments={donutSegments.length > 0 ? donutSegments : [{ value: 1, color: "#E5E7EB" }]}
              total={totalCount}
              size={100}
            />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Ouverts",  value: openCount,       pct: pctOpen,       color: "#3B82F6" },
                { label: "En cours", value: inProgressCount, pct: pctInProgress, color: "#F59E0B" },
                { label: "Résolus",  value: resolvedCount,   pct: pctResolved,   color: "#22C55E" },
              ].map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>{item.label}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: item.color }}>{item.value}</Typography>
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>·</Typography>
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600 }}>{item.pct}%</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 4, borderRadius: "999px", backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                    <Box sx={{
                      height: "100%", width: `${item.pct}%`,
                      borderRadius: "999px", backgroundColor: item.color,
                      transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)", opacity: 0.85,
                    }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Activité mensuelle */}
        <Paper elevation={0} sx={{ borderRadius: "16px", padding: "20px 22px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Activité mensuelle
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#EFF6FF", borderRadius: "20px", padding: "3px 10px" }}>
              <Box sx={{ color: "#2563EB", display: "flex", alignItems: "center" }}>{zapIcon}</Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>{totalCount} total</Typography>
            </Box>
          </Box>
          <MiniBarChart data={monthlyData} />
        </Paper>

        {/* Conseil du jour */}
        <Paper elevation={0} sx={{
          borderRadius: "16px", padding: "20px 22px",
          border: "1px solid #FDE68A", backgroundColor: "#FEFCE8",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mb: "12px" }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: "10px",
              backgroundColor: "#FEF3C7",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#F59E0B", flexShrink: 0,
            }}>
              {lightbulbIcon}
            </Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Conseil du jour
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6, flex: 1 }}>
            {todayTip}
          </Typography>
        </Paper>

      </Box>

      {/* ── Tableau tickets ── */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Mes tickets</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}{activeFilter !== "all" ? " filtrés" : " récents"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
              {DashboardIcon.filter}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filtrer</Typography>
            </Box>
          </Box>

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

        <Box sx={{ padding: "8px 6px 12px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "40px 24px" }}>
              <Box sx={{ fontSize: "34px", mb: "10px" }}>📋</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>Aucun ticket dans cette catégorie</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Vos tickets apparaîtront ici dès leur création</Typography>
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