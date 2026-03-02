// src/pages/admin/AdminDashboard.jsx
// Page principale — layout only. Toute la logique visuelle est dans adminCharts.jsx et adminRows.jsx

import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { DashboardHeader, DashboardIcon } from "../../components/common/DashboardShared";
import { getGreeting } from "../../components/common/DashboardSharedUtils";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

import {
  KpiCardSpark,
  DonutChart,
  CreatedVsResolvedChart,
  AreaLineChart,
  StackedPriorityBar,
} from "./adminCharts";

import {
  SectionHeader,
  UserRow,
  AuditRow,
  UrgentRow,
  TechGauge,
} from "./adminRows";

// ── Données statiques ─────────────────────────────────────────────────────────

const AUDIT_LOG = [
  { id: 1, actor: "Admin FST", action: "Règles de priorité mises à jour",        time: "5 min",  icon: "shield"   },
  { id: 2, actor: "Système",   action: "Nouveau rôle attribué à Lina Trabelsi",  time: "1h",     icon: "user"     },
  { id: 3, actor: "Admin FST", action: "Configuration des alertes modifiée",     time: "3h",     icon: "settings" },
  { id: 4, actor: "Système",   action: "8 tickets importés via synchronisation", time: "Hier",   icon: "upload"   },
];

// Option C — Créés vs Résolus par mois (données mock 6 mois)
// "created" = tickets ouverts ce mois · "resolved" = tickets résolus ce mois
// Si resolved > created → l'équipe réduit le backlog ✓
const MONTHLY = [
  { label: "Sep", created: 3, resolved: 2 },
  { label: "Oct", created: 5, resolved: 4 },
  { label: "Nov", created: 4, resolved: 6 },
  { label: "Déc", created: 7, resolved: 5 },
  { label: "Jan", created: 8, resolved: 6 },
  { label: "Fév", created: 6, resolved: 7 },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user: authUser } = useAuth();

  // ── Métriques tickets ──
  const totalTickets    = tickets.length;
  const openTickets     = tickets.filter((t) => t.statut === "open").length;
  const criticalTickets = tickets.filter((t) => t.priorite === "critical").length;
  const resolvedTickets = tickets.filter((t) => t.statut === "resolved" || t.statut === "closed").length;
  const inProgressCount = tickets.filter((t) => t.statut === "in_progress" || t.statut === "assigned").length;
  const pctResolution   = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  const priorityCounts = {
    critical: tickets.filter((t) => t.priorite === "critical").length,
    high:     tickets.filter((t) => t.priorite === "high").length,
    medium:   tickets.filter((t) => t.priorite === "medium").length,
    low:      tickets.filter((t) => t.priorite === "low").length,
  };

  // ── Utilisateurs & techniciens ──
  const totalUsers   = users.length;
  const technicians  = users.filter((u) => u.role === "technician");
  const techWorkload = technicians.map((tech) => ({
    ...tech,
    assigned: tickets.filter((t) => t.technicienId === tech.id && (t.statut === "assigned" || t.statut === "in_progress")).length,
    total:    tickets.filter((t) => t.technicienId === tech.id).length,
    resolved: tickets.filter((t) => t.technicienId === tech.id && (t.statut === "resolved" || t.statut === "closed")).length,
  }));

  // ── Tickets urgents ──
  const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const urgentTickets = tickets
    .filter((t) => t.statut === "open" || t.priorite === "critical")
    .sort((a, b) => pOrder[a.priorite] - pOrder[b.priorite])
    .slice(0, 4);

  // ── Donut segments ──
  const donutSegments = [
    { value: openTickets,     color: "#3B82F6" },
    { value: inProgressCount, color: "#F59E0B" },
    { value: resolvedTickets, color: "#22C55E" },
  ].filter((s) => s.value > 0);

  // ── Sparklines (mock 6 mois se terminant par la vraie valeur) ──
  const sparkTickets  = [3, 5, 4, 7, 8, totalTickets];
  const sparkCritical = [1, 2, 1, 3, 4, criticalTickets];
  const sparkUsers    = [2, 2, 3, 4, 4, totalUsers];
  const sparkResolved = [2, 4, 6, 5, 6, pctResolution];

  const firstName = (authUser?.name || "Admin").split(" ")[0];

  return (
    <Box sx={{ pb: "80px" }}>

      {/* ── Header ── */}
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

      {/* ── Ligne 1 : KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", mb: "18px" }}>
        <KpiCardSpark icon={DashboardIcon.ticket}        label="Total tickets"     count={totalTickets}        color="#2563EB" bgColor="#EFF6FF" description="Tous statuts confondus"        sparkData={sparkTickets}  trend={12} />
        <KpiCardSpark icon={DashboardIcon.alertTriangle} label="Tickets critiques" count={criticalTickets}     color="#EF4444" bgColor="#FEF2F2" description="Nécessitent attention"          sparkData={sparkCritical} trend={-8} />
        <KpiCardSpark icon={DashboardIcon.users}         label="Utilisateurs"      count={totalUsers}          color="#8B5CF6" bgColor="#F5F3FF" description="Comptes actifs"                sparkData={sparkUsers}    trend={5}  />
        <KpiCardSpark icon={DashboardIcon.check}         label="Taux résolution"   count={`${pctResolution}%`} color="#22C55E" bgColor="#F0FDF4" description={`${resolvedTickets} clôturés`} sparkData={sparkResolved} trend={18} />
      </Box>

      {/* ── Ligne 2 : Tendance globale + Créés vs Résolus ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "16px", mb: "16px" }}>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Tendance des tickets"
            subtitle="Évolution mensuelle — 6 derniers mois"
            right={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#EFF6FF", borderRadius: "8px", padding: "4px 10px" }}>
                <Box sx={{ color: "#2563EB", display: "flex" }}>{DashboardIcon.barChart}</Box>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>{totalTickets} total</Typography>
              </Box>
            }
          />
          <Box sx={{ padding: "16px 20px 10px" }}>
            <AreaLineChart data={MONTHLY} color="#2563EB" />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Créés vs Résolus"
            subtitle="✓ = mois où l'équipe réduit le backlog"
          />
          <Box sx={{ padding: "16px 20px 14px" }}>
            <CreatedVsResolvedChart data={MONTHLY} />
          </Box>
        </Paper>

      </Box>

      {/* ── Ligne 3 : Donut statuts + Priorités + Tickets urgents ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.2fr", gap: "16px", mb: "16px" }}>

        {/* Donut */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "16px" }}>
            Répartition statuts
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <DonutChart segments={donutSegments.length > 0 ? donutSegments : [{ value: 1, color: "#E5E7EB" }]} total={totalTickets} size={110} />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { label: "Ouverts",  value: openTickets,     pct: totalTickets > 0 ? Math.round(openTickets / totalTickets * 100)     : 0, color: "#3B82F6" },
                { label: "En cours", value: inProgressCount, pct: totalTickets > 0 ? Math.round(inProgressCount / totalTickets * 100) : 0, color: "#F59E0B" },
                { label: "Résolus",  value: resolvedTickets, pct: totalTickets > 0 ? Math.round(resolvedTickets / totalTickets * 100) : 0, color: "#22C55E" },
              ].map((item) => (
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

        {/* Stacked priorities */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "16px" }}>
            Répartition priorités
          </Typography>
          <StackedPriorityBar counts={priorityCounts} total={totalTickets} />
        </Paper>

        {/* Tickets urgents */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Tickets urgents"
            subtitle="Ouverts et critiques"
            right={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#FEF2F2", borderRadius: "8px", padding: "3px 9px" }}>
                <Box sx={{ color: "#EF4444", display: "flex" }}>{DashboardIcon.alertTriangle}</Box>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444" }}>{openTickets} ouverts</Typography>
              </Box>
            }
          />
          <Box sx={{ padding: "6px 6px 8px" }}>
            {urgentTickets.map((t, i) => <UrgentRow key={t.id} ticket={t} isLast={i === urgentTickets.length - 1} />)}
          </Box>
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "9px 20px", textAlign: "center" }}>
            <Link to="/admin/tickets" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB", "&:hover": { textDecoration: "underline" } }}>Voir tous les tickets →</Typography>
            </Link>
          </Box>
        </Paper>

      </Box>

      {/* ── Ligne 4 : Utilisateurs + Charge techniciens + Audit ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "16px" }}>

        {/* Utilisateurs */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Utilisateurs"
            subtitle={`${totalUsers} comptes enregistrés`}
            right={<Link to="/admin/users" style={{ textDecoration: "none" }}><Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>Gérer →</Typography></Link>}
          />
          <Box>
            {users.map((u, i) => <UserRow key={u.id} user={u} isLast={i === users.length - 1} />)}
          </Box>
        </Paper>

        {/* Charge techniciens */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader title="Charge techniciens" subtitle="Taux d'activité en temps réel" />
          <Box sx={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {techWorkload.map((tech) => (
              <TechGauge key={tech.id} tech={tech} assigned={tech.assigned} total={tech.total} resolved={tech.resolved} />
            ))}
          </Box>
          <Divider sx={{ borderColor: "#F3F4F6", mx: "12px" }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px" }}>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Disponibles maintenant</Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#22C55E" }}>
              {techWorkload.filter((t) => t.assigned === 0).length} / {technicians.length}
            </Typography>
          </Box>
        </Paper>

        {/* Audit log */}
        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <SectionHeader
            title="Journal d'activité"
            subtitle="Actions système récentes"
          />
          <Box>
            {AUDIT_LOG.map((e, i) => <AuditRow key={e.id} entry={e} isLast={i === AUDIT_LOG.length - 1} />)}
          </Box>
          <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "9px 20px", textAlign: "center" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Télécharger le journal complet →
            </Typography>
          </Box>
        </Paper>

      </Box>

    </Box>
  );
}