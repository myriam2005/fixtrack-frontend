// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { DashboardHeader } from "../../components/common/dashboard/DashboardShared";
import { getGreeting } from "../../components/common/dashboard/DashboardSharedUtils";
import { ticketService, userService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DashboardIcon } from "../../components/common/dashboard/DashboardIconConstants";

import {
  KpiCardSpark, DonutChart, CreatedVsResolvedChart,
  AreaLineChart, StackedPriorityBar,
} from "./adminCharts";

import {
  SectionHeader, UserRow, AuditRow, UrgentRow, TechGauge,
} from "./adminRows";

// ✅ Résout technicienId populé ou string
const resolveId = (val) => {
  if (!val) return null;
  if (typeof val === "object") return String(val._id || val.id || "");
  return String(val);
};

function buildMonthlyData(tickets) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
    const created  = tickets.filter(t => {
      const td = new Date(t.createdAt || t.dateCreation);
      return td.getFullYear() === year && td.getMonth() === month;
    }).length;
    const resolved = tickets.filter(t => {
      const td = new Date(t.updatedAt || t.createdAt || t.dateCreation);
      return td.getFullYear() === year && td.getMonth() === month
        && (t.statut === "resolved" || t.statut === "closed");
    }).length;
    months.push({ label, created, resolved });
  }
  return months;
}

function buildSpark(tickets, filterFn) {
  const now = new Date();
  const points = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push(tickets.filter(t => {
      const td = new Date(t.createdAt || t.dateCreation);
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth() && filterFn(t);
    }).length);
  }
  return points;
}

function mapLog(log, index) {
  const actor =
    (log.userId && typeof log.userId === "object" ? log.userId.nom : null) ||
    log.actor || "Système";
  const action = log.details
    ? `${log.action} — ${log.details}`
    : log.action || "Action système";
  const iconMap = { error: "shield", warning: "settings", info: "check" };
  return {
    id:     log._id || log.id || index,
    actor,
    action,
    time:   formatRelativeTime(log.createdAt || log.date),
    // On garde aussi la date ISO pour l'export CSV
    dateISO: log.createdAt || log.date || null,
    icon:   iconMap[log.type] || "shield",
    type:   log.type || "info",
  };
}

// ✅ Génère et télécharge un fichier CSV depuis les logs
function downloadLogsCSV(logs, allLogs) {
  // On utilise allLogs (données brutes complètes) si disponibles, sinon logs affichés
  const rows = (allLogs.length > 0 ? allLogs : logs).map(log => {
    const actor  = (log.userId && typeof log.userId === "object" ? log.userId.nom : null) || log.actor || "Système";
    const action = log.details ? `${log.action} — ${log.details}` : (log.action || "");
    const type   = log.type || "info";
    const date   = log.createdAt || log.date
      ? new Date(log.createdAt || log.date).toLocaleString("fr-FR")
      : "—";
    // Échappe les guillemets dans les champs
    const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;
    return [escape(date), escape(actor), escape(type.toUpperCase()), escape(action)].join(";");
  });

  const header = ["Date", "Acteur", "Type", "Action"].map(h => `"${h}"`).join(";");
  const csv    = "\uFEFF" + [header, ...rows].join("\n"); // \uFEFF = BOM pour Excel UTF-8
  const blob   = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const link   = document.createElement("a");
  link.href     = url;
  link.download = `journal_activite_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { user: authUser } = useAuth();

  const [tickets,  setTickets]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [logs,     setLogs]     = useState([]);      // logs mappés pour affichage
  const [rawLogs,  setRawLogs]  = useState([]);      // logs bruts pour export complet
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([ticketService.getAll(), userService.getAll()])
      .then(([t, u]) => {
        setTickets((t || []).map(x => ({ ...x, id: x._id || x.id })));
        setUsers((u || []).map(x => ({ ...x, id: x._id || x.id })));
      })
      .catch(console.error);

    const token = (() => {
      try { return JSON.parse(localStorage.getItem("currentUser") || "{}")?.token || ""; }
      catch { return ""; }
    })();

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/logs?limit=500`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const raw = Array.isArray(data) ? data
          : Array.isArray(data.logs) ? data.logs
          : Array.isArray(data.data) ? data.data : [];
        const sorted = [...raw].sort(
          (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        );
        setRawLogs(sorted);                          // garde tous les logs pour export
        setLogs(sorted.slice(0, 6).map(mapLog));     // affiche les 6 plus récents
      })
      .catch(() => { setLogs([]); setRawLogs([]); });
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalTickets    = tickets.length;
  const openTickets     = tickets.filter(t => t.statut === "open").length;
  const criticalTickets = tickets.filter(t => t.priorite === "critical").length;
  const resolvedTickets = tickets.filter(t => t.statut === "resolved" || t.statut === "closed").length;
  const inProgressCount = tickets.filter(t => t.statut === "in_progress" || t.statut === "assigned").length;
  const pctResolution   = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  const priorityCounts = {
    critical: tickets.filter(t => t.priorite === "critical").length,
    high:     tickets.filter(t => t.priorite === "high").length,
    medium:   tickets.filter(t => t.priorite === "medium").length,
    low:      tickets.filter(t => t.priorite === "low").length,
  };

  const totalUsers  = users.length;
  const technicians = users.filter(u => u.role === "technician");

  const techWorkload = useMemo(() => technicians.map(tech => {
    const tid      = String(tech._id || tech.id || "");
    const assigned = tickets.filter(t => resolveId(t.technicienId) === tid && (t.statut === "assigned" || t.statut === "in_progress")).length;
    const total    = tickets.filter(t => resolveId(t.technicienId) === tid).length;
    const resolved = tickets.filter(t => resolveId(t.technicienId) === tid && (t.statut === "resolved" || t.statut === "closed")).length;
    return { ...tech, assigned, total, resolved };
  }), [technicians, tickets]);

  const monthly = useMemo(() => buildMonthlyData(tickets), [tickets]);

  const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const urgentTickets = useMemo(() =>
    tickets.filter(t => t.statut === "open" || t.priorite === "critical")
      .sort((a, b) => pOrder[a.priorite] - pOrder[b.priorite]).slice(0, 4),
    [tickets]
  );

  const sparkTickets  = useMemo(() => [...buildSpark(tickets, () => true), totalTickets], [tickets, totalTickets]);
  const sparkCritical = useMemo(() => [...buildSpark(tickets, t => t.priorite === "critical"), criticalTickets], [tickets, criticalTickets]);
  const sparkUsers    = useMemo(() => [totalUsers, totalUsers, totalUsers, totalUsers, totalUsers, totalUsers], [totalUsers]);
  const sparkResolved = useMemo(() => [...buildSpark(tickets, t => t.statut === "resolved" || t.statut === "closed"), pctResolution], [tickets, pctResolution]);

  const donutSegments = [
    { value: openTickets,     color: "#3B82F6" },
    { value: inProgressCount, color: "#F59E0B" },
    { value: resolvedTickets, color: "#22C55E" },
  ].filter(s => s.value > 0);

  const prevMonthTickets  = monthly[monthly.length - 2]?.created  || 0;
  const currMonthTickets  = monthly[monthly.length - 1]?.created  || 0;
  const trendTickets      = prevMonthTickets > 0 ? Math.round(((currMonthTickets - prevMonthTickets) / prevMonthTickets) * 100) : 0;
  const prevMonthResolved = monthly[monthly.length - 2]?.resolved || 0;
  const currMonthResolved = monthly[monthly.length - 1]?.resolved || 0;
  const trendResolved     = prevMonthResolved > 0 ? Math.round(((currMonthResolved - prevMonthResolved) / prevMonthResolved) * 100) : 0;

  const firstName = (authUser?.nom || authUser?.name || "Admin").split(" ")[0];

  const fallbackLogs = [
    { id: "f1", actor: "Système", action: `${totalTickets} tickets au total`,              time: "maintenant", icon: "shield",   type: "info" },
    { id: "f2", actor: "Système", action: `${resolvedTickets} tickets résolus/clôturés`,   time: "maintenant", icon: "check",    type: "info" },
    { id: "f3", actor: "Système", action: `${criticalTickets} tickets critiques actifs`,   time: "maintenant", icon: "settings", type: criticalTickets > 0 ? "warning" : "info" },
    { id: "f4", actor: "Système", action: `${technicians.length} techniciens enregistrés`, time: "maintenant", icon: "user",     type: "info" },
  ];
  const displayedLogs = logs.length > 0 ? logs : fallbackLogs;

  // ✅ Handler téléchargement CSV
  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadLogsCSV(displayedLogs, rawLogs);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <Box sx={{ pb: "80px" }}>

      <DashboardHeader
        firstName={firstName}
        greeting={getGreeting()}
        subtitle="Vue d'ensemble du système FixTrack"
        rightSlot={
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 12px" }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22C55E", animation: "blink 2s ease-in-out infinite", "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } } }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Système opérationnel</Typography>
          </Box>
        }
      />

      {/* ── KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", mb: "18px" }}>
        <KpiCardSpark icon={DashboardIcon.ticket}        label="Total tickets"     count={totalTickets}        color="#2563EB" bgColor="#EFF6FF" description="Tous statuts confondus"        sparkData={sparkTickets}  trend={trendTickets}  />
        <KpiCardSpark icon={DashboardIcon.alertTriangle} label="Tickets critiques" count={criticalTickets}     color="#EF4444" bgColor="#FEF2F2" description="Nécessitent attention"          sparkData={sparkCritical} trend={criticalTickets > 0 ? -5 : 0} />
        <KpiCardSpark icon={DashboardIcon.users}         label="Utilisateurs"      count={totalUsers}          color="#8B5CF6" bgColor="#F5F3FF" description="Comptes enregistrés"           sparkData={sparkUsers}    trend={0}             />
        <KpiCardSpark icon={DashboardIcon.check}         label="Taux résolution"   count={`${pctResolution}%`} color="#22C55E" bgColor="#F0FDF4" description={`${resolvedTickets} clôturés`} sparkData={sparkResolved} trend={trendResolved} />
      </Box>

      {/* ── Graphes mensuels ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "16px", mb: "16px" }}>
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Tendance des tickets" subtitle="Évolution mensuelle — 6 derniers mois"
            right={<Box sx={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#EFF6FF", borderRadius: "8px", padding: "4px 10px" }}><Box sx={{ color: "#2563EB", display: "flex" }}>{DashboardIcon.barChart}</Box><Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>{totalTickets} total</Typography></Box>}
          />
          <Box sx={{ padding: "16px 20px 10px" }}><AreaLineChart data={monthly} color="#2563EB" /></Box>
        </Paper>
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Créés vs Résolus" subtitle="✓ = mois où l'équipe réduit le backlog" />
          <Box sx={{ padding: "16px 20px 14px" }}><CreatedVsResolvedChart data={monthly} /></Box>
        </Paper>
      </Box>

      {/* ── Stats + Urgents ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.2fr", gap: "16px", mb: "16px" }}>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "16px" }}>Répartition statuts</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <DonutChart segments={donutSegments.length > 0 ? donutSegments : [{ value: 1, color: "#E5E7EB" }]} total={totalTickets} size={110} />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { label: "Ouverts",  value: openTickets,     pct: totalTickets > 0 ? Math.round(openTickets / totalTickets * 100)     : 0, color: "#3B82F6" },
                { label: "En cours", value: inProgressCount, pct: totalTickets > 0 ? Math.round(inProgressCount / totalTickets * 100) : 0, color: "#F59E0B" },
                { label: "Résolus",  value: resolvedTickets, pct: totalTickets > 0 ? Math.round(resolvedTickets / totalTickets * 100) : 0, color: "#22C55E" },
              ].map(item => (
                <Box key={item.label}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: "3px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color }} />
                      <Typography sx={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>{item.label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: item.color }}>{item.value}</Typography>
                  </Box>
                  <Box sx={{ height: 3, borderRadius: "999px", backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${item.pct}%`, borderRadius: "999px", backgroundColor: item.color, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "16px" }}>Répartition priorités</Typography>
          <StackedPriorityBar counts={priorityCounts} total={totalTickets} />
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Tickets urgents" subtitle="Ouverts et critiques"
            right={<Box sx={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#FEF2F2", borderRadius: "8px", padding: "3px 9px" }}><Box sx={{ color: "#EF4444", display: "flex" }}>{DashboardIcon.alertTriangle}</Box><Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444" }}>{openTickets} ouverts</Typography></Box>}
          />
          <Box sx={{ padding: "6px 6px 8px" }}>
            {urgentTickets.length === 0 ? (
              <Box sx={{ textAlign: "center", py: "24px", color: "#9CA3AF", fontSize: "13px" }}>Aucun ticket urgent</Box>
            ) : (
              urgentTickets.map((t, i) => (
                <UrgentRow key={t.id || t._id} ticket={t} isLast={i === urgentTickets.length - 1} />
              ))
            )}
          </Box>
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "9px 20px", textAlign: "center" }}>
            <Link to="/admin/tickets" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB", "&:hover": { textDecoration: "underline" } }}>
                Voir tous les tickets →
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>

      {/* ── Utilisateurs + Charge + Logs ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "16px" }}>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Utilisateurs" subtitle={`${totalUsers} comptes enregistrés`}
            right={<Link to="/admin/users" style={{ textDecoration: "none" }}><Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>Gérer →</Typography></Link>}
          />
          <Box>
            {users.slice(0, 6).map((u, i) => (
              <UserRow key={u.id || u._id} user={u} isLast={i === Math.min(users.length, 6) - 1} />
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Charge techniciens" subtitle="Taux d'activité en temps réel" />
          <Box sx={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {techWorkload.length === 0 ? (
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", py: "16px" }}>Aucun technicien</Typography>
            ) : (
              techWorkload.map(tech => (
                <TechGauge key={tech.id || tech._id} tech={tech} assigned={tech.assigned} total={tech.total} resolved={tech.resolved} />
              ))
            )}
          </Box>
          <Divider sx={{ borderColor: "#F3F4F6", mx: "12px" }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px" }}>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Disponibles maintenant</Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#22C55E" }}>
              {techWorkload.filter(t => t.assigned === 0).length} / {technicians.length}
            </Typography>
          </Box>
        </Paper>

        {/* ✅ Journal d'activité avec téléchargement CSV fonctionnel */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Journal d'activité"
            subtitle={logs.length > 0 ? `${rawLogs.length} entrées au total` : "Statistiques système"}
          />
          <Box>
            {displayedLogs.map((e, i) => (
              <AuditRow key={e.id} entry={e} isLast={i === displayedLogs.length - 1} />
            ))}
          </Box>
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "9px 20px", textAlign: "center" }}>
            {/* ✅ Bouton téléchargement CSV — déclenche downloadLogsCSV() */}
            <Box
              onClick={handleDownload}
              sx={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "12px", fontWeight: 600, color: downloading ? "#9CA3AF" : "#2563EB",
                cursor: downloading ? "not-allowed" : "pointer",
                transition: "color 0.15s",
                "&:hover": { textDecoration: downloading ? "none" : "underline" },
              }}
            >
              {downloading ? (
                <>
                  <Box component="span" sx={{ display: "inline-block", width: 12, height: 12, border: "2px solid #D1D5DB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.6s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
                  Téléchargement…
                </>
              ) : (
                <>
                  {/* Icône download */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Télécharger le journal complet (.csv)
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "—";
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "À l'instant";
  if (mins  < 60) return `${mins} min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}