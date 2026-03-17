// src/pages/employee/EmpDashboard.jsx
// ✅ VERSION BACKEND — même design, données réelles via API

import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider, LinearProgress } from "@mui/material";

import Badge from "../../components/common/badge/Badge";
import { DashboardHeader, KpiCard } from "../../components/common/dashboard/DashboardShared";
import { getGreeting, formatDate } from "../../components/common/dashboard/DashboardSharedUtils";
import { DashboardIcon } from "../../components/common/dashboard/DashboardIconConstants";
import { useAuth } from "../../context/AuthContext";
import { ticketService, notificationService } from "../../services/api";

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: { label: "Critique", color: "#EF4444", bg: "#FEF2F2" },
  high:     { label: "Haute",    color: "#F59E0B", bg: "#FFFBEB" },
  medium:   { label: "Moyenne",  color: "#3B82F6", bg: "#EFF6FF" },
  low:      { label: "Faible",   color: "#6B7280", bg: "#F3F4F6" },
};

const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "open",        label: "Ouverts"  },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
];

// ─── Icônes inline ────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ─── Progression ticket ───────────────────────────────────────────────────────
function TicketProgress({ statut }) {
  const steps = ["open", "assigned", "in_progress", "resolved"];
  const stepIndex = { open: 0, assigned: 1, in_progress: 2, resolved: 3, closed: 3 };
  const current = stepIndex[statut] ?? 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: "6px" }}>
      {steps.map((step, i) => {
        const done   = i <= current;
        const isCurr = i === current;
        return (
          <Box key={step} sx={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <Box sx={{
              width: isCurr ? 10 : 7, height: isCurr ? 10 : 7, borderRadius: "50%",
              backgroundColor: done ? (isCurr ? "#2563EB" : "#93C5FD") : "#E5E7EB",
              border: isCurr ? "2px solid #BFDBFE" : "none",
              boxShadow: isCurr ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
              flexShrink: 0, transition: "all 0.2s",
            }} />
            {i < steps.length - 1 && (
              <Box sx={{ flex: 1, height: 2, mx: "3px", backgroundColor: i < current ? "#93C5FD" : "#E5E7EB", borderRadius: 1 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Carte ticket ─────────────────────────────────────────────────────────────
function TicketCard({ ticket, isLast }) {
  const prio = PRIORITY_CONFIG[ticket.priorite] || PRIORITY_CONFIG.low;
  return (
    <>
      <Box sx={{
        padding: "14px 20px",
        display: "flex", alignItems: "flex-start", gap: "14px",
        transition: "background 0.15s",
        "&:hover": { backgroundColor: "#F8FAFF" },
      }}>
        <Box sx={{
          width: 5, borderRadius: "3px", alignSelf: "stretch",
          backgroundColor: prio.color, flexShrink: 0, opacity: 0.7, minHeight: 48,
        }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", mb: "5px" }}>
            <Typography sx={{
              fontWeight: 700, fontSize: "13.5px", color: "#111827",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
            }}>
              {ticket.titre}
            </Typography>
            <Badge status={ticket.statut} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "6px", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                {formatDate(ticket.createdAt || ticket.dateCreation)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {DashboardIcon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.localisation}
              </Typography>
            </Box>
            <Box sx={{
              display: "inline-flex", px: "7px", py: "2px", borderRadius: "6px",
              backgroundColor: prio.bg, border: `1px solid ${prio.color}33`,
            }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: prio.color }}>{prio.label}</Typography>
            </Box>
          </Box>
          <TicketProgress statut={ticket.statut} />
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "20px" }} />}
    </>
  );
}

// ─── Notification item ────────────────────────────────────────────────────────
function NotifItem({ notif, isLast }) {
  const typeConfig = {
    ticket_assigned:  { icon: "🔧", bg: "#F5F3FF" },
    ticket_resolved:  { icon: "✅", bg: "#F0FDF4" },
    ticket_critical:  { icon: "⚠️", bg: "#FEF2F2" },
    status_changed:   { icon: "⚙️", bg: "#FFFBEB" },
    ticket_validated: { icon: "📋", bg: "#EFF6FF" },
    alert:            { icon: "🔔", bg: "#FEF2F2" },
  };
  const cfg = typeConfig[notif.type] || { icon: "📢", bg: "#F3F4F6" };

  const formatTs = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffMin < 1440) return `Il y a ${Math.round(diffMin / 60)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <>
      <Box sx={{
        display: "flex", alignItems: "flex-start", gap: "12px",
        padding: "12px 18px",
        backgroundColor: notif.lu ? "transparent" : "#FAFBFF",
        position: "relative",
        "&:hover": { backgroundColor: "#F5F7FF" },
        transition: "background 0.15s",
      }}>
        {!notif.lu && (
          <Box sx={{
            position: "absolute", top: 14, right: 18,
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: "#2563EB", boxShadow: "0 0 0 2px #EFF6FF",
          }} />
        )}
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px",
          backgroundColor: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "15px",
        }}>
          {cfg.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pr: "16px" }}>
          <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: notif.lu ? 400 : 600, lineHeight: 1.4, mb: "3px" }}>
            {notif.message}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ClockIcon />
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
              {formatTs(notif.createdAt || notif.timestamp)}
            </Typography>
          </Box>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ─── Bandeau urgence ──────────────────────────────────────────────────────────
function UrgentBanner({ ticket }) {
  if (!ticket) return null;
  return (
    <Box sx={{
      borderRadius: "12px",
      background: "linear-gradient(120deg, #FEF2F2 0%, #FFF5F5 100%)",
      border: "1px solid #FECACA",
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: "14px",
      mb: "20px",
    }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: "10px",
        backgroundColor: "#FEE2E2",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: "18px",
      }}>🚨</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.06em", mb: "2px" }}>
          Ticket critique — En attente de prise en charge
        </Typography>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#7F1D1D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.titre}
        </Typography>
        <Typography sx={{ fontSize: "11px", color: "#B91C1C" }}>
          {ticket.localisation} · Soumis le {formatDate(ticket.createdAt || ticket.dateCreation)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Profil utilisateur ───────────────────────────────────────────────────────
function ProfileCard({ user, totalTickets, resolvedCount }) {
  const pct = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;
  const initials = (user?.nom || user?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Paper elevation={0} sx={{
      borderRadius: "16px", padding: "20px",
      border: "1px solid #E5E7EB",
      background: "linear-gradient(145deg, #FAFBFF 0%, #FFFFFF 100%)",
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "16px" }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: "12px",
          background: "linear-gradient(135deg, #2563EB, #3B82F6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: "16px",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)", flexShrink: 0,
        }}>
          {user?.avatar || initials}
        </Box>
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
            {user?.nom || user?.name || "Utilisateur"}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: "2px" }}>{user?.email || ""}</Typography>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            mt: "4px", px: "8px", py: "2px", borderRadius: "6px",
            backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE",
          }}>
            <UserIcon />
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.04em" }}>
              UTILISATEUR
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "#F3F4F6", mb: "14px" }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { label: "Total tickets soumis", value: totalTickets, color: "#2563EB" },
          { label: "Résolus avec succès",  value: resolvedCount, color: "#22C55E" },
        ].map((s) => (
          <Box key={s.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{s.label}</Typography>
            <Typography sx={{ fontSize: "17px", fontWeight: 800, color: s.color }}>{s.value}</Typography>
          </Box>
        ))}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Taux de résolution</Typography>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#22C55E" }}>{pct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={pct}
            sx={{
              height: 6, borderRadius: 3, backgroundColor: "#E5E7EB",
              "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #22C55E, #16A34A)", borderRadius: 3 },
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%", mb = 0 }) {
  return (
    <Box sx={{
      height: h, width: w, borderRadius: 2,
      backgroundColor: "#F1F5F9",
      mb: `${mb}px`,
      animation: "pulse 1.5s ease-in-out infinite",
      "@keyframes pulse": {
        "0%,100%": { opacity: 1 },
        "50%": { opacity: 0.5 },
      },
    }} />
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function EmpDashboard() {
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  // ✅ États backend
  const [myTickets,      setMyTickets]      = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [loading,        setLoading]        = useState(true);

  // ✅ Fetch données réelles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, notifsRes] = await Promise.all([
          ticketService.getAll(),
          notificationService.getAll(),
        ]);
        setMyTickets(ticketsRes.data || []);
        setNotifications((notifsRes.data || []).slice(0, 4));
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Marquer tout comme lu
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const totalCount      = myTickets.length;
  const openCount       = myTickets.filter(t => t.statut === "open").length;
  const inProgressCount = myTickets.filter(t => t.statut === "in_progress" || t.statut === "assigned").length;
  const resolvedCount   = myTickets.filter(t => t.statut === "resolved" || t.statut === "closed").length;
  const urgentTicket    = myTickets.find(t => t.statut === "open" && t.priorite === "critical");
  const unreadCount     = notifications.filter(n => !n.lu).length;

  const filteredTickets = useMemo(() => {
    const sorted = [...myTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeFilter === "open")        return sorted.filter(t => t.statut === "open");
    if (activeFilter === "in_progress") return sorted.filter(t => t.statut === "in_progress" || t.statut === "assigned");
    if (activeFilter === "resolved")    return sorted.filter(t => t.statut === "resolved" || t.statut === "closed");
    return sorted.slice(0, 6);
  }, [myTickets, activeFilter]);

  const firstName = (authUser?.nom || authUser?.name || "").split(" ")[0];

  return (
    <Box sx={{ pb: "60px" }}>

      <DashboardHeader firstName={firstName} greeting={getGreeting()} subtitle="Voici vos activités de maintenance" />

      {!loading && <UrgentBanner ticket={urgentTicket} />}

      {/* ── KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", mb: "22px" }}>
        {loading ? (
          [1,2,3].map(i => (
            <Paper key={i} elevation={0} sx={{ borderRadius: "14px", p: "18px", border: "1px solid #E5E7EB" }}>
              <Skeleton h={40} mb={10} />
              <Skeleton h={14} w="60%" />
            </Paper>
          ))
        ) : (
          <>
            <KpiCard icon={DashboardIcon.ticket} label="Tickets ouverts"  count={openCount}       color="#3B82F6" bgColor="#EFF6FF" description="En attente de prise en charge" />
            <KpiCard icon={DashboardIcon.clock}  label="En cours"         count={inProgressCount} color="#F59E0B" bgColor="#FFFBEB" description="Assignés ou en traitement" />
            <KpiCard icon={DashboardIcon.check}  label="Résolus"          count={resolvedCount}   color="#22C55E" bgColor="#F0FDF4" description="Clôturés avec succès" />
          </>
        )}
      </Box>

      {/* ── Layout 2 colonnes ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* ── Gauche : Mes tickets ── */}
        <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Box sx={{ padding: "16px 20px 0", borderBottom: "1px solid #F3F4F6" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Mes tickets</Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "2px" }}>
                  {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                  {activeFilter !== "all" ? " filtrés" : " récents"}
                </Typography>
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
                    <Box sx={{
                      backgroundColor: isActive ? "#2563EB" : "#E5E7EB",
                      color: isActive ? "#fff" : "#6B7280",
                      borderRadius: "20px", px: "6px",
                      fontSize: "11px", fontWeight: 700, lineHeight: "18px", minWidth: "18px", textAlign: "center",
                    }}>
                      {count}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ py: "4px" }}>
            {loading ? (
              <Box sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1,2,3].map(i => <Skeleton key={i} h={60} />)}
              </Box>
            ) : filteredTickets.length === 0 ? (
              <Box sx={{ textAlign: "center", py: "40px" }}>
                <Typography sx={{ fontSize: "32px", mb: "10px" }}>📋</Typography>
                <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>Aucun ticket dans cette catégorie</Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Vos tickets apparaîtront ici dès leur création</Typography>
              </Box>
            ) : (
              filteredTickets.map((ticket, index) => (
                <TicketCard key={ticket._id || ticket.id} ticket={ticket} isLast={index === filteredTickets.length - 1} />
              ))
            )}
          </Box>

          {activeFilter === "all" && myTickets.length > 6 && (
            <Box sx={{ borderTop: "1px solid #F3F4F6", padding: "12px 20px", textAlign: "center" }}>
              <Link to="/employee/tickets" style={{ textDecoration: "none" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2563EB" }}>
                  Voir tous mes tickets →
                </Typography>
              </Link>
            </Box>
          )}
        </Paper>

        {/* ── Droite ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          <ProfileCard user={authUser} totalTickets={totalCount} resolvedCount={resolvedCount} />

          {/* Notifications */}
          <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <Box sx={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box sx={{ color: "#F59E0B" }}><BellIcon /></Box>
                <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Box sx={{ backgroundColor: "#EF4444", color: "#fff", borderRadius: "20px", px: "6px", py: "1px", fontSize: "10px", fontWeight: 800, lineHeight: "16px" }}>
                    {unreadCount}
                  </Box>
                )}
              </Box>
              {unreadCount > 0 && (
                <Typography onClick={handleMarkAllRead} sx={{ fontSize: "11px", color: "#2563EB", fontWeight: 600, cursor: "pointer" }}>
                  Tout marquer lu
                </Typography>
              )}
            </Box>
            <Divider sx={{ borderColor: "#F3F4F6" }} />
            {loading ? (
              <Box sx={{ p: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1,2,3].map(i => <Skeleton key={i} h={40} />)}
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: "30px" }}>
                <Typography sx={{ fontSize: "26px", mb: "8px" }}>🔔</Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Aucune notification</Typography>
              </Box>
            ) : (
              notifications.map((notif, index) => (
                <NotifItem key={notif._id || notif.id} notif={notif} isLast={index === notifications.length - 1} />
              ))
            )}
          </Paper>

          {/* Conseil du jour */}
          <Paper elevation={0} sx={{
            borderRadius: "16px", border: "1px solid #FDE68A",
            backgroundColor: "#FEFCE8", padding: "16px 18px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mb: "10px" }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "8px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>
                💡
              </Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Conseil du jour
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "12.5px", color: "#92400E", lineHeight: 1.65 }}>
              Décrivez précisément la localisation et les symptômes du problème pour accélérer l'intervention du technicien.
            </Typography>
          </Paper>

        </Box>
      </Box>
    </Box>
  );
}