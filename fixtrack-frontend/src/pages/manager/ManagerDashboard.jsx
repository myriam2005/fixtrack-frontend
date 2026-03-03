// src/pages/manager/MgrDashboard.jsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider, Avatar } from "@mui/material";
import Badge from "../../components/common/Badge";
import {
  DashboardHeader,
  KpiCard,
} from "../../components/common/DashboardShared";
import { getGreeting, formatDate } from "../../components/common/DashboardSharedUtils";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { DashboardIcon } from "../../components/common/DashboardIconConstants";

// ── Constantes ─────────────────────────────────────────────────────────────────
const PRIORITY_BORDER = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#3B82F6",
  low:      "#D1D5DB",
};

const CATEGORY_COLORS = {
  "Informatique": "#3B82F6",
  "Électrique":   "#F59E0B",
  "HVAC":         "#06B6D4",
  "Plomberie":    "#8B5CF6",
  "Mécanique":    "#EF4444",
  "Sécurité":     "#22C55E",
};

const PRIORITY_CONFIG = {
  critical: { label: "Critique", color: "#EF4444", bg: "#FEF2F2" },
  high:     { label: "Haute",    color: "#F97316", bg: "#FFF7ED" },
  medium:   { label: "Moyenne",  color: "#3B82F6", bg: "#EFF6FF" },
  low:      { label: "Basse",    color: "#6B7280", bg: "#F9FAFB" },
};

// ── Icônes locales ─────────────────────────────────────────────────────────────
const alertIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const clockUrgentIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const NOW = Date.now();

// ── Feature 1 : Tickets non assignés en urgence ────────────────────────────────
function UnassignedUrgentPanel({ unassignedTickets, techniciens }) {
  const getDaysAgo = (dateStr) => {
    const diff = NOW - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (unassignedTickets.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: "28px" }}>
        <Box sx={{ fontSize: "28px", mb: "8px" }}>✅</Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#22C55E" }}>
          Tous les tickets critiques sont assignés
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {unassignedTickets.map((ticket) => {
        const cfg     = PRIORITY_CONFIG[ticket.priorite] || PRIORITY_CONFIG.medium;
        const daysAgo = getDaysAgo(ticket.dateCreation);
        const isUrgent = daysAgo >= 1 && ticket.priorite === "critical";

        return (
          <Box key={ticket.id} sx={{
            borderRadius: "12px",
            border: `1.5px solid ${cfg.color}33`,
            backgroundColor: isUrgent ? `${cfg.color}08` : "#FAFAFA",
            padding: "10px 14px",
            transition: "all 0.18s",
            "&:hover": {
              backgroundColor: `${cfg.color}10`,
              border: `1.5px solid ${cfg.color}55`,
              transform: "translateX(3px)",
            },
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: "12.5px", fontWeight: 700, color: "#111827",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "4px",
                }}>
                  {ticket.titre}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#9CA3AF" }}>
                    {DashboardIcon.pin}
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.localisation}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: daysAgo >= 1 ? "#EF4444" : "#9CA3AF" }}>
                    {clockUrgentIcon}
                    <Typography sx={{ fontSize: "10px", fontWeight: daysAgo >= 1 ? 700 : 400, color: daysAgo >= 1 ? "#EF4444" : "#9CA3AF" }}>
                      {daysAgo === 0 ? "Aujourd'hui" : `${daysAgo}j sans tech`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{
                flexShrink: 0, backgroundColor: cfg.bg,
                border: `1px solid ${cfg.color}33`,
                borderRadius: "8px", padding: "3px 8px",
              }}>
                <Typography sx={{ fontSize: "10px", fontWeight: 700, color: cfg.color }}>
                  {cfg.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}

      <Box sx={{
        mt: "4px", borderRadius: "10px", padding: "10px 14px",
        backgroundColor: "#F0F7FF", border: "1px dashed #BFDBFE",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <Box sx={{ color: "#2563EB", display: "flex" }}>{DashboardIcon.users}</Box>
        <Typography sx={{ fontSize: "11px", color: "#2563EB", fontWeight: 600 }}>
          {techniciens.length} technicien{techniciens.length > 1 ? "s" : ""} disponible{techniciens.length > 1 ? "s" : ""} pour assignation
        </Typography>
        <Box sx={{ ml: "auto" }}>
          <Link to="/manager/tickets" style={{ textDecoration: "none" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>Assigner →</Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

// ── Feature 2 : Comparaison charge techniciens ─────────────────────────────────
function TechComparisonPanel({ techniciens, allTickets }) {
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => {
    return techniciens.map((tech) => {
      const actifs  = allTickets.filter((t) => t.technicienId === tech.id && ["assigned","in_progress"].includes(t.statut)).length;
      const resolus = allTickets.filter((t) => t.technicienId === tech.id && ["resolved","closed"].includes(t.statut)).length;
      const total   = actifs + resolus;
      const score   = total > 0 ? Math.round((resolus / total) * 100) : 0;
      const nom     = (tech.nom || "Tech").split(" ")[0];
      const competences = tech.competences || [];
      const chargeLevel = actifs <= 3 ? "ok" : actifs <= 6 ? "busy" : "overloaded";
      return { id: tech.id, nom, actifs, resolus, total, score, competences, chargeLevel };
    });
  }, [techniciens, allTickets]);

  const maxActifs = Math.max(...data.map((d) => d.actifs), 1);

  const chargeColor = {
    ok:         { bar: "#22C55E", badge: "#F0FDF4", text: "#16A34A", label: "Disponible" },
    busy:       { bar: "#F59E0B", badge: "#FFFBEB", text: "#D97706", label: "Chargé"     },
    overloaded: { bar: "#EF4444", badge: "#FEF2F2", text: "#DC2626", label: "Surchargé"  },
  };

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: "24px" }}>
        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Aucun technicien</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "14px" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)`, gap: "10px" }}>
        {data.map((tech) => {
          const isSel  = selected === tech.id;
          const cfg    = chargeColor[tech.chargeLevel];
          const barPct = (tech.actifs / maxActifs) * 100;

          return (
            <Box key={tech.id} onClick={() => setSelected(isSel ? null : tech.id)} sx={{
              borderRadius: "14px",
              border: `1.5px solid ${isSel ? cfg.bar + "80" : "#F3F4F6"}`,
              backgroundColor: isSel ? `${cfg.bar}08` : "#FAFAFA",
              padding: "12px", cursor: "pointer", transition: "all 0.18s",
              "&:hover": { backgroundColor: `${cfg.bar}08`, border: `1.5px solid ${cfg.bar}40` },
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}>
                <Avatar sx={{
                  width: 28, height: 28, fontSize: "11px", fontWeight: 700,
                  backgroundColor: isSel ? cfg.bar : `${cfg.bar}20`,
                  color: isSel ? "#FFFFFF" : cfg.bar, transition: "all 0.18s",
                }}>
                  {tech.nom[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{tech.nom}</Typography>
                  <Box sx={{ backgroundColor: cfg.badge, borderRadius: "4px", padding: "1px 5px", mt: "2px", display: "inline-block" }}>
                    <Typography sx={{ fontSize: "9px", fontWeight: 700, color: cfg.text }}>{cfg.label}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: "8px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: "3px" }}>
                  <Typography sx={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Charge</Typography>
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: cfg.bar }}>{tech.actifs} actifs</Typography>
                </Box>
                <Box sx={{ height: 5, borderRadius: "999px", backgroundColor: "#E5E7EB", overflow: "hidden" }}>
                  <Box sx={{
                    width: `${barPct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${cfg.bar}, ${cfg.bar}BB)`,
                    borderRadius: "999px", transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "9px", color: "#9CA3AF" }}>{tech.resolus} résolus</Typography>
                <Box sx={{ backgroundColor: "#F3F4F6", borderRadius: "6px", padding: "2px 6px" }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#374151" }}>{tech.score}% résol.</Typography>
                </Box>
              </Box>

              {isSel && tech.competences.length > 0 && (
                <Box sx={{ mt: "8px", pt: "8px", borderTop: "1px solid #F3F4F6" }}>
                  <Typography sx={{ fontSize: "9px", color: "#9CA3AF", mb: "4px", textTransform: "uppercase", fontWeight: 600 }}>Compétences</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {tech.competences.map((c) => (
                      <Box key={c} sx={{ backgroundColor: "#EFF6FF", borderRadius: "4px", padding: "1px 6px" }}>
                        <Typography sx={{ fontSize: "9px", fontWeight: 600, color: "#2563EB" }}>{c}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", gap: "12px", mt: "10px", justifyContent: "center" }}>
        {Object.entries(chargeColor).map(([key, cfg]) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.bar }} />
            <Typography sx={{ fontSize: "9px", color: "#9CA3AF" }}>{cfg.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Feature 3 : Heatmap catégories ────────────────────────────────────────────
function CategoryHeatmap({ allTickets }) {
  const [hovered, setHovered] = useState(null);

  const data = useMemo(() => {
    const counts = {};
    allTickets.forEach((t) => {
      if (!counts[t.categorie]) counts[t.categorie] = { total: 0, open: 0, resolved: 0 };
      counts[t.categorie].total++;
      if (["open","assigned","in_progress"].includes(t.statut)) counts[t.categorie].open++;
      if (["resolved","closed"].includes(t.statut)) counts[t.categorie].resolved++;
    });
    return Object.entries(counts)
      .map(([cat, stats]) => ({ cat, ...stats }))
      .sort((a, b) => b.total - a.total);
  }, [allTickets]);

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <Box sx={{ mt: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((item) => {
        const isHov    = hovered === item.cat;
        const color    = CATEGORY_COLORS[item.cat] || "#6B7280";
        const openPct  = item.total > 0 ? Math.round((item.open     / item.total) * 100) : 0;
        const resPct   = item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0;
        const intensity = item.total / maxTotal;

        return (
          <Box key={item.cat}
            onMouseEnter={() => setHovered(item.cat)}
            onMouseLeave={() => setHovered(null)}
            sx={{
              borderRadius: "10px", padding: "8px 12px",
              backgroundColor: isHov ? `${color}12` : "#F9FAFB",
              border: `1px solid ${isHov ? color + "40" : "#F3F4F6"}`,
              transition: "all 0.18s", cursor: "default",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "5px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: color, opacity: 0.4 + intensity * 0.6 }} />
                <Typography sx={{ fontSize: "12px", fontWeight: isHov ? 700 : 500, color: isHov ? "#111827" : "#374151", transition: "all 0.15s" }}>
                  {item.cat}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isHov && (
                  <>
                    <Typography sx={{ fontSize: "10px", color: "#EF4444", fontWeight: 600 }}>{openPct}% actifs</Typography>
                    <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                    <Typography sx={{ fontSize: "10px", color: "#22C55E", fontWeight: 600 }}>{resPct}% résolus</Typography>
                    <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                  </>
                )}
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color }}>{item.total}</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 4, borderRadius: "999px", backgroundColor: "#E5E7EB", overflow: "hidden", display: "flex" }}>
              <Box sx={{ width: `${openPct}%`,  height: "100%", backgroundColor: "#EF4444", opacity: 0.7, transition: "width 0.5s" }} />
              <Box sx={{ width: `${resPct}%`, height: "100%", backgroundColor: color, opacity: 0.8, transition: "width 0.5s" }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Ligne ticket récent ────────────────────────────────────────────────────────
function RecentTicketRow({ ticket, techniciens, isLast }) {
  const tech     = techniciens.find((u) => u.id === ticket.technicienId);
  const techName = tech ? (tech.nom || "—").split(" ")[0] : null;

  return (
    <>
      <Box sx={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 18px 12px 16px",
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        transition: "background 0.15s, padding-left 0.15s",
        "&:hover": { backgroundColor: "#F8FAFF", paddingLeft: "20px" },
      }}>
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB",
          boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite]||"#E5E7EB")}22`,
        }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "3px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.localisation}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          {techName ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: "9px", fontWeight: 700, backgroundColor: "#DBEAFE", color: "#2563EB" }}>
                {techName[0]}
              </Avatar>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{techName}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF2F2", borderRadius: "6px", padding: "2px 8px" }}>
              <Box sx={{ color: "#EF4444", display: "flex" }}>{alertIcon}</Box>
              <Typography sx={{ fontSize: "11px", color: "#EF4444", fontWeight: 600 }}>Non assigné</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
          <Badge status={ticket.priorite} />
          <Badge status={ticket.statut} />
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function MgrDashboard() {
  const { user: authUser } = useAuth();

  const allTickets  = tickets;
  const techniciens = useMemo(() => users.filter((u) => u.role === "technician"), []);

  // KPIs
  const totalCount      = allTickets.length;
  const openCount       = allTickets.filter((t) => t.statut === "open").length;
  const inProgressCount = allTickets.filter((t) => ["in_progress","assigned"].includes(t.statut)).length;
  const resolvedCount   = allTickets.filter((t) => ["resolved","closed"].includes(t.statut)).length;
  const resolutionRate  = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Tickets non assignés urgents
  const unassignedUrgent = useMemo(() => {
    const ORDER = { critical: 0, high: 1 };
    return [...allTickets]
      .filter((t) => !t.technicienId && ["critical","high"].includes(t.priorite) && !["resolved","closed"].includes(t.statut))
      .sort((a, b) => (ORDER[a.priorite]??9) - (ORDER[b.priorite]??9) || new Date(a.dateCreation) - new Date(b.dateCreation))
      .slice(0, 4);
  }, [allTickets]);

  // ✅ 3 tickets les plus récents (toutes priorités / statuts)
  const recentTickets = useMemo(() => {
    return [...allTickets]
      .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
      .slice(0, 3);
  }, [allTickets]);

  const firstName = (authUser?.name || "Manager").split(" ")[0];

  return (
    <Box sx={{ pb: "80px" }}>

      {/* ── Header ── */}
      <DashboardHeader
        firstName={firstName}
        greeting={getGreeting()}
        subtitle="Supervision globale de la maintenance"
        rightSlot={
          unassignedUrgent.length > 0 ? (
            <Box sx={{
              display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px", padding: "5px 12px",
            }}>
              <Box sx={{ color: "#FCA5A5", display: "flex" }}>{alertIcon}</Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FCA5A5" }}>
                {unassignedUrgent.length} ticket{unassignedUrgent.length > 1 ? "s" : ""} sans technicien
              </Typography>
            </Box>
          ) : null
        }
      />

      {/* ── KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", mb: "20px" }}>
        <KpiCard icon={DashboardIcon.ticket}        label="Total tickets"   count={totalCount}           color="#2563EB" bgColor="#EFF6FF" description="Tous statuts" />
        <KpiCard icon={DashboardIcon.alertTriangle} label="Ouverts"         count={openCount}            color="#EF4444" bgColor="#FEF2F2" description="En attente d'assignation" />
        <KpiCard icon={DashboardIcon.clock}         label="En traitement"   count={inProgressCount}      color="#F59E0B" bgColor="#FFFBEB" description="Assignés ou en cours" />
        <KpiCard icon={DashboardIcon.check}         label="Taux résolution" count={`${resolutionRate}%`} color="#22C55E" bgColor="#F0FDF4" description={`${resolvedCount} résolus`} />
      </Box>

      {/* ── Ligne 2 : Urgences non assignées + Comparaison techniciens ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", mb: "20px" }}>

        <Paper elevation={0} sx={{
          borderRadius: "16px", padding: "20px 22px",
          border: `1px solid ${unassignedUrgent.length > 0 ? "#FECACA" : "#E5E7EB"}`,
          backgroundColor: unassignedUrgent.length > 0 ? "#FFFAFA" : "#FFFFFF",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: unassignedUrgent.length > 0 ? "#EF4444" : "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                À assigner en urgence
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>
                Critiques et hautes priorités sans technicien
              </Typography>
            </Box>
            {unassignedUrgent.length > 0 && (
              <Box sx={{ backgroundColor: "#FEE2E2", borderRadius: "20px", padding: "3px 10px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Box sx={{ color: "#EF4444", display: "flex" }}>{alertIcon}</Box>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444" }}>
                  {unassignedUrgent.length} ticket{unassignedUrgent.length > 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Box>
          <UnassignedUrgentPanel unassignedTickets={unassignedUrgent} techniciens={techniciens} />
        </Paper>

        <Paper elevation={0} sx={{
          borderRadius: "16px", padding: "20px 22px",
          border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Charge des techniciens
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>
                Cliquez pour voir les compétences
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#F5F3FF", borderRadius: "20px", padding: "3px 10px" }}>
              <Box sx={{ color: "#8B5CF6", display: "flex" }}>{DashboardIcon.users}</Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#8B5CF6" }}>{techniciens.length} techs</Typography>
            </Box>
          </Box>
          <TechComparisonPanel techniciens={techniciens} allTickets={allTickets} />
        </Paper>
      </Box>

      {/* ── Ligne 3 : Tableau 3 tickets récents ── */}
      <Paper elevation={0} sx={{
        borderRadius: "14px", border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        overflow: "hidden", mb: "20px",
      }}>
        <Box sx={{ padding: "16px 24px 14px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
              Tickets récents
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
              Les 3 derniers tickets créés sur la plateforme
            </Typography>
          </Box>
          <Link to="/manager/tickets" style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", "&:hover": { opacity: 0.75 } }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>Voir tous</Typography>
              {DashboardIcon.arrowRight}
            </Box>
          </Link>
        </Box>

        <Box sx={{ padding: "8px 6px 12px" }}>
          {recentTickets.map((ticket, index) => (
            <RecentTicketRow
              key={ticket.id}
              ticket={ticket}
              techniciens={techniciens}
              isLast={index === recentTickets.length - 1}
            />
          ))}
        </Box>
      </Paper>

      {/* ── Ligne 4 : Heatmap catégories ── */}
      <Paper elevation={0} sx={{
        borderRadius: "16px", padding: "20px 22px",
        border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "4px" }}>
          <Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Incidents par catégorie
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>
              Volume et répartition actifs / résolus — survolez pour les détails
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "12px" }}>
            {[{ color: "#EF4444", label: "Actifs" }, { color: "#22C55E", label: "Résolus" }, { color: "#E5E7EB", label: "Neutre" }].map((item) => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Box sx={{ width: 8, height: 4, borderRadius: "2px", backgroundColor: item.color }} />
                <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <CategoryHeatmap allTickets={allTickets} />
      </Paper>

    </Box>
  );
}