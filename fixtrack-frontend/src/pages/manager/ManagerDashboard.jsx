// src/pages/manager/MgrDashboard.jsx
// ✅ Sync fixes :
//    — tickets "refused" apparaissent dans le panneau "À assigner en urgence"
//    — section dédiée aux tickets refusés si présents
//    — KPIs cohérents avec le vrai statut en base

import { useMemo, useState, useEffect } from "react";
import { Link }                         from "react-router-dom";
import { Box, Typography, Paper, Divider, Avatar } from "@mui/material";
import Badge                            from "../../components/common/badge/Badge";
import { DashboardHeader, KpiCard }     from "../../components/common/dashboard/DashboardShared";
import { getGreeting, formatDate }      from "../../components/common/dashboard/DashboardSharedUtils";
import { useAuth }                      from "../../context/AuthContext";
import { DashboardIcon }                from "../../components/common/dashboard/DashboardIconConstants";
import { ticketService, userService }   from "../../services/api";

const PRIORITY_BORDER = {
  critical: "#EF4444", high: "#F97316", medium: "#3B82F6", low: "#D1D5DB",
};
const CATEGORY_COLORS = {
  "Informatique": "#3B82F6", "Électrique": "#F59E0B", "HVAC": "#06B6D4",
  "Plomberie": "#8B5CF6", "Mécanique": "#EF4444", "Sécurité": "#22C55E",
};
const PRIORITY_CONFIG = {
  critical: { label: "Critique", color: "#EF4444", bg: "#FEF2F2" },
  high:     { label: "Haute",    color: "#F97316", bg: "#FFF7ED" },
  medium:   { label: "Moyenne",  color: "#3B82F6", bg: "#EFF6FF" },
  low:      { label: "Basse",    color: "#6B7280", bg: "#F9FAFB" },
};

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

if (typeof document !== "undefined" && !document.getElementById("mgr-dash-styles")) {
  const s = document.createElement("style");
  s.id = "mgr-dash-styles";
  s.textContent = `
    @keyframes mgr-fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    .mgr-ticket-row { transition: background 0.15s, padding-left 0.15s !important; }
    .mgr-ticket-row:hover { background: #F8FAFF !important; padding-left: 20px !important; }
    .mgr-urgent-item { transition: all 0.18s cubic-bezier(.22,1,.36,1) !important; }
    .mgr-urgent-item:hover { transform: translateX(3px) !important; }
    .mgr-tech-card { transition: all 0.18s cubic-bezier(.22,1,.36,1) !important; }
    .mgr-tech-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
    .mgr-cat-row { transition: all 0.18s !important; }
    .mgr-kpi-card { animation: mgr-fadeSlide 0.4s ease both; }
  `;
  document.head.appendChild(s);
}

const NOW = Date.now();

function Skeleton({ h = 20, w = "100%", mb = 0, br = 8 }) {
  return (
    <Box sx={{ height: h, width: w, borderRadius: br, mb: `${mb}px`, backgroundColor: "#F1F5F9", animation: "pulse 1.5s ease-in-out infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }} />
  );
}

// ── Panel urgence : tickets non-assignés + tickets refusés en attente ─────────
function UnassignedUrgentPanel({ unassignedTickets, refusedTickets, techCount }) {
  const getDaysAgo = (dateStr) => Math.floor((NOW - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));

  const allUrgent = [...unassignedTickets, ...refusedTickets];

  if (allUrgent.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: "28px" }}>
        <Box sx={{ fontSize: "28px", mb: "8px" }}>✅</Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#22C55E" }}>Tous les tickets critiques sont assignés</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {allUrgent.map((ticket, i) => {
        const cfg       = PRIORITY_CONFIG[ticket.priorite] || PRIORITY_CONFIG.medium;
        const daysAgo   = getDaysAgo(ticket.createdAt || ticket.dateCreation);
        const isRefused = ticket.statut === "refused";
        return (
          <Box key={ticket._id || ticket.id} className="mgr-urgent-item" sx={{
            borderRadius: "12px",
            border: `1.5px solid ${isRefused ? "#FECACA" : cfg.color + "33"}`,
            backgroundColor: isRefused ? "#FFF5F5" : (daysAgo >= 1 && ticket.priorite === "critical") ? `${cfg.color}08` : "#FAFAFA",
            padding: "10px 14px",
            animation: `mgr-fadeSlide 0.35s ease ${i * 0.06}s both`,
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: isRefused ? "#991B1B" : "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "4px" }}>
                  {ticket.titre}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    {DashboardIcon.pin}
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.localisation}
                    </Typography>
                  </Box>
                  {isRefused ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#DC2626" }}>
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#DC2626" }}>Refusé — à réassigner</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: daysAgo >= 1 ? "#EF4444" : "#9CA3AF" }}>
                      {clockUrgentIcon}
                      <Typography sx={{ fontSize: "10px", fontWeight: daysAgo >= 1 ? 700 : 400, color: daysAgo >= 1 ? "#EF4444" : "#9CA3AF" }}>
                        {daysAgo === 0 ? "Aujourd'hui" : `${daysAgo}j sans tech`}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {isRefused && ticket.refusedReason && (
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", mt: "2px", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    "{ticket.refusedReason}"
                  </Typography>
                )}
              </Box>
              <Box sx={{ flexShrink: 0, backgroundColor: isRefused ? "#FEF2F2" : cfg.bg, border: `1px solid ${isRefused ? "#FECACA" : cfg.color + "33"}`, borderRadius: "8px", padding: "3px 8px" }}>
                <Typography sx={{ fontSize: "10px", fontWeight: 700, color: isRefused ? "#DC2626" : cfg.color }}>
                  {isRefused ? "Refusé" : cfg.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
      <Box sx={{ mt: "4px", borderRadius: "10px", padding: "10px 14px", backgroundColor: "#F0F7FF", border: "1px dashed #BFDBFE", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Box sx={{ color: "#2563EB", display: "flex" }}>{DashboardIcon.users}</Box>
        <Typography sx={{ fontSize: "11px", color: "#2563EB", fontWeight: 600 }}>
          {techCount} technicien{techCount > 1 ? "s" : ""} disponible{techCount > 1 ? "s" : ""} pour assignation
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

function TechComparisonPanel({ techniciens, allTickets }) {
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => {
    return techniciens.map((tech) => {
      const techId  = tech._id || tech.id;
      // ✅ "refused" n'est pas considéré comme actif pour le technicien
      const actifs  = allTickets.filter(t => (t.technicienId?._id || t.technicienId) === techId && ["assigned","in_progress"].includes(t.statut)).length;
      const resolus = allTickets.filter(t => (t.technicienId?._id || t.technicienId) === techId && ["resolved","closed"].includes(t.statut)).length;
      const total   = actifs + resolus;
      const score   = total > 0 ? Math.round((resolus / total) * 100) : 0;
      const nom     = (tech.nom || "Tech").split(" ")[0];
      const chargeLevel = actifs <= 3 ? "ok" : actifs <= 6 ? "busy" : "overloaded";
      return { id: techId, nom, actifs, resolus, total, score, competences: tech.competences || [], chargeLevel };
    });
  }, [techniciens, allTickets]);

  const maxActifs   = Math.max(...data.map(d => d.actifs), 1);
  const chargeColor = {
    ok:         { bar: "#22C55E", badge: "#F0FDF4", text: "#16A34A", label: "Disponible" },
    busy:       { bar: "#F59E0B", badge: "#FFFBEB", text: "#D97706", label: "Chargé"     },
    overloaded: { bar: "#EF4444", badge: "#FEF2F2", text: "#DC2626", label: "Surchargé"  },
  };

  if (data.length === 0) return <Box sx={{ textAlign: "center", py: "24px" }}><Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Aucun technicien</Typography></Box>;

  return (
    <Box sx={{ mt: "14px" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: `repeat(${Math.min(data.length,3)},1fr)` }, gap: "10px" }}>
        {data.map((tech, i) => {
          const isSel  = selected === tech.id;
          const cfg    = chargeColor[tech.chargeLevel];
          const barPct = (tech.actifs / maxActifs) * 100;
          return (
            <Box key={tech.id} className="mgr-tech-card" onClick={() => setSelected(isSel ? null : tech.id)} sx={{ borderRadius: "14px", border: `1.5px solid ${isSel ? cfg.bar + "80" : "#F3F4F6"}`, backgroundColor: isSel ? `${cfg.bar}08` : "#FAFAFA", padding: "12px", cursor: "pointer", animation: `mgr-fadeSlide 0.4s ease ${i * 0.07}s both` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: "11px", fontWeight: 700, backgroundColor: isSel ? cfg.bar : `${cfg.bar}20`, color: isSel ? "#FFFFFF" : cfg.bar, transition: "all 0.18s" }}>{tech.nom[0]}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#111827", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tech.nom}</Typography>
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
                  <Box sx={{ width: `${barPct}%`, height: "100%", background: `linear-gradient(90deg, ${cfg.bar}, ${cfg.bar}BB)`, borderRadius: "999px", transition: "width 0.6s" }} />
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
                    {tech.competences.map(c => (
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
    </Box>
  );
}

function CategoryHeatmap({ allTickets }) {
  const [hovered, setHovered] = useState(null);
  const data = useMemo(() => {
    const counts = {};
    // ✅ "refused" est un ticket ouvert (non résolu) → compte dans "open"
    allTickets.forEach(t => {
      if (!counts[t.categorie]) counts[t.categorie] = { total: 0, open: 0, resolved: 0 };
      counts[t.categorie].total++;
      if (["open","assigned","in_progress","refused"].includes(t.statut)) counts[t.categorie].open++;
      if (["resolved","closed"].includes(t.statut)) counts[t.categorie].resolved++;
    });
    return Object.entries(counts).map(([cat, stats]) => ({ cat, ...stats })).sort((a, b) => b.total - a.total);
  }, [allTickets]);

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  return (
    <Box sx={{ mt: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((item, i) => {
        const isHov   = hovered === item.cat;
        const color   = CATEGORY_COLORS[item.cat] || "#6B7280";
        const openPct = item.total > 0 ? Math.round((item.open / item.total) * 100) : 0;
        const resPct  = item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0;
        return (
          <Box key={item.cat} className="mgr-cat-row" onMouseEnter={() => setHovered(item.cat)} onMouseLeave={() => setHovered(null)}
            sx={{ borderRadius: "10px", padding: "8px 12px", backgroundColor: isHov ? `${color}12` : "#F9FAFB", border: `1px solid ${isHov ? color + "40" : "#F3F4F6"}`, cursor: "default", animation: `mgr-fadeSlide 0.35s ease ${i * 0.05}s both` }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "5px", flexWrap: "wrap", gap: "4px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: color, opacity: 0.4 + (item.total / maxTotal) * 0.6 }} />
                <Typography sx={{ fontSize: "12px", fontWeight: isHov ? 700 : 500, color: isHov ? "#111827" : "#374151" }}>{item.cat}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isHov && (<>
                  <Typography sx={{ fontSize: "10px", color: "#EF4444", fontWeight: 600 }}>{openPct}% actifs</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#22C55E", fontWeight: 600 }}>{resPct}% résolus</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                </>)}
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color }}>{item.total}</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 4, borderRadius: "999px", backgroundColor: "#E5E7EB", overflow: "hidden", display: "flex" }}>
              <Box sx={{ width: `${openPct}%`, height: "100%", backgroundColor: "#EF4444", opacity: 0.7, transition: "width 0.5s" }} />
              <Box sx={{ width: `${resPct}%`, height: "100%", backgroundColor: color, opacity: 0.8, transition: "width 0.5s" }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function RecentTicketRow({ ticket, isLast, index }) {
  const tech     = ticket.technicienId;
  const techName = tech ? (tech.nom || "—").split(" ")[0] : null;
  const isRefused = ticket.statut === "refused";
  return (
    <>
      <Box className="mgr-ticket-row" sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: "10px", sm: "12px" }, padding: { xs: "12px 12px 12px 10px", sm: "12px 18px 12px 16px" }, borderLeft: `3px solid ${isRefused ? "#EF4444" : (PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}`, borderRadius: "0 10px 10px 0", backgroundColor: isRefused ? "#FFF5F5" : "transparent", animation: `mgr-fadeSlide 0.35s ease ${index * 0.08}s both` }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: isRefused ? "#EF4444" : (PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"), display: { xs: "none", sm: "block" } }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: isRefused ? "#991B1B" : "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "3px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.createdAt || ticket.dateCreation)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {DashboardIcon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.localisation}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          {techName ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: "9px", fontWeight: 700, backgroundColor: isRefused ? "#FEF2F2" : "#DBEAFE", color: isRefused ? "#DC2626" : "#2563EB" }}>{techName[0]}</Avatar>
              <Typography sx={{ fontSize: "11px", color: isRefused ? "#DC2626" : "#6B7280", display: { xs: "none", sm: "block" }, fontWeight: isRefused ? 600 : 400 }}>{techName}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF2F2", borderRadius: "6px", padding: "2px 8px" }}>
              <Box sx={{ color: "#EF4444", display: "flex" }}>{alertIcon}</Box>
              <Typography sx={{ fontSize: "11px", color: "#EF4444", fontWeight: 600, display: { xs: "none", sm: "block" } }}>Non assigné</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, alignItems: { xs: "center", sm: "flex-end" }, gap: "4px", flexShrink: 0 }}>
          <Badge status={ticket.priorite} />
          <Badge status={ticket.statut} />
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: { xs: "10px", sm: "18px" } }} />}
    </>
  );
}

export default function MgrDashboard() {
  const { user: authUser } = useAuth();
  const [allTickets,  setAllTickets]  = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tickets, techs] = await Promise.all([
          ticketService.getAll(),
          userService.getTechnicians(),
        ]);
        setAllTickets(tickets || []);
        setTechniciens(techs || []);
      } catch { /* silencieux */ }
      finally { setLoading(false); }
    })();
  }, []);

  const totalCount      = allTickets.length;
  const openCount       = allTickets.filter(t => t.statut === "open").length;
  // ✅ "refused" = ticket actif qui a besoin d'action → inclus dans "En traitement"
  const inProgressCount = allTickets.filter(t => ["in_progress","assigned","refused"].includes(t.statut)).length;
  const resolvedCount   = allTickets.filter(t => ["resolved","closed"].includes(t.statut)).length;
  const resolutionRate  = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // ✅ Tickets non-assignés urgents (open sans tech, priorité critique/haute)
  const unassignedUrgent = useMemo(() => {
    const ORDER = { critical: 0, high: 1 };
    return [...allTickets]
      .filter(t => !t.technicienId && ["critical","high"].includes(t.priorite) && t.statut === "open")
      .sort((a, b) => (ORDER[a.priorite] ?? 9) - (ORDER[b.priorite] ?? 9))
      .slice(0, 4);
  }, [allTickets]);

  // ✅ Tickets refusés — à réassigner en urgence
  const refusedUrgent = useMemo(() =>
    allTickets.filter(t => t.statut === "refused").slice(0, 4),
    [allTickets]
  );

  const hasUrgent = unassignedUrgent.length > 0 || refusedUrgent.length > 0;

  const recentTickets = useMemo(() =>
    [...allTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [allTickets]
  );

  const firstName = (authUser?.nom || authUser?.name || "Manager").split(" ")[0];

  return (
    <Box sx={{ pb: { xs: "60px", sm: "80px" } }}>
      <DashboardHeader
        firstName={firstName} greeting={getGreeting()} subtitle="Supervision globale de la maintenance"
        rightSlot={
          hasUrgent ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "5px 12px" }}>
              <Box sx={{ color: "#FCA5A5", display: "flex" }}>{alertIcon}</Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FCA5A5" }}>
                {unassignedUrgent.length + refusedUrgent.length} ticket{(unassignedUrgent.length + refusedUrgent.length) > 1 ? "s" : ""} à traiter
              </Typography>
            </Box>
          ) : null
        }
      />

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4,1fr)" }, gap: { xs: "10px", sm: "14px" }, mb: "20px" }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <Paper key={i} elevation={0} sx={{ borderRadius: "14px", p: "18px", border: "1px solid #E5E7EB" }}>
              <Skeleton h={40} mb={10} /><Skeleton h={14} w="60%" />
            </Paper>
          ))
        ) : (
          [
            { icon: DashboardIcon.ticket,        label: "Total tickets",   count: totalCount,           color: "#2563EB", bgColor: "#EFF6FF", description: "Tous statuts"             },
            { icon: DashboardIcon.alertTriangle, label: "Ouverts",         count: openCount,            color: "#EF4444", bgColor: "#FEF2F2", description: "En attente d'assignation" },
            { icon: DashboardIcon.clock,         label: "En traitement",   count: inProgressCount,      color: "#F59E0B", bgColor: "#FFFBEB", description: "Assignés, en cours, refusés" },
            { icon: DashboardIcon.check,         label: "Taux résolution", count: `${resolutionRate}%`, color: "#22C55E", bgColor: "#F0FDF4", description: `${resolvedCount} résolus` },
          ].map((kpi, i) => (
            <Box key={i} className="mgr-kpi-card"><KpiCard {...kpi} /></Box>
          ))
        )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "16px", mb: "20px" }}>
        {/* ✅ Panneau urgence — inclut les refusés */}
        <Paper elevation={0} sx={{ borderRadius: "16px", padding: "20px 22px", border: `1px solid ${hasUrgent ? "#FECACA" : "#E5E7EB"}`, backgroundColor: hasUrgent ? "#FFFAFA" : "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: hasUrgent ? "#EF4444" : "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>À assigner en urgence</Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>
            Non assignés critiques{refusedUrgent.length > 0 ? " + tickets refusés" : ""}
          </Typography>
          {loading
            ? <Box sx={{ mt: "14px" }}><Skeleton h={60} mb={8} /><Skeleton h={60} /></Box>
            : <UnassignedUrgentPanel unassignedTickets={unassignedUrgent} refusedTickets={refusedUrgent} techCount={techniciens.length} />
          }
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: "16px", padding: "20px 22px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Charge des techniciens</Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>Cliquez pour voir les compétences</Typography>
          {loading
            ? <Box sx={{ mt: "14px" }}><Skeleton h={80} mb={8} /><Skeleton h={80} /></Box>
            : <TechComparisonPanel techniciens={techniciens} allTickets={allTickets} />
          }
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", mb: "20px" }}>
        <Box sx={{ padding: "16px 24px 14px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Tickets récents</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>Les 3 derniers tickets créés sur la plateforme</Typography>
          </Box>
          <Link to="/manager/tickets" style={{ textDecoration: "none" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>Voir tous →</Typography>
          </Link>
        </Box>
        <Box sx={{ padding: "8px 6px 12px" }}>
          {loading
            ? <Box sx={{ p: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>{[1,2,3].map(i => <Skeleton key={i} h={60} />)}</Box>
            : recentTickets.map((ticket, index) => (
                <RecentTicketRow key={ticket._id || ticket.id} ticket={ticket} isLast={index === recentTickets.length - 1} index={index} />
              ))
          }
        </Box>
      </Paper>
    </Box>
  );
}