import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  Avatar, Tooltip, Badge, Chip, useTheme, useMediaQuery,
  alpha, Button,
} from "@mui/material";

const icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  ticket:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>,
  plus:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  machine:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  report:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  team:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  config:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  collapse:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
};

const SIDEBAR_BG     = "#1E3A5F";
const SIDEBAR_ACCENT = "#2563EB";
const SIDEBAR_W_OPEN = 260;
const SIDEBAR_W_MINI = 72;

const NAV_LINKS = {
  employee: [
    { label: "Tableau de bord", to: "/employee/dashboard", icon: icons.dashboard },
    { label: "Mes tickets",     to: "/employee/tickets",   icon: icons.ticket },
  ],
  technician: [
    { label: "Tableau de bord",  to: "/technician/dashboard", icon: icons.dashboard },
    { label: "Tickets assignés", to: "/technician/tickets",   icon: icons.ticket },
    { label: "Rapports",         to: "/technician/reports",   icon: icons.report },
  ],
  manager: [
    { label: "Tableau de bord",  to: "/manager/dashboard", icon: icons.dashboard },
    { label: "Tous les tickets", to: "/manager/tickets",   icon: icons.ticket },
    { label: "Machines",         to: "/manager/machines",  icon: icons.machine },
    { label: "Équipe",           to: "/manager/team",      icon: icons.team },
    { label: "Rapports",         to: "/manager/reports",   icon: icons.report },
  ],
  admin: [
    { label: "Tableau de bord",  to: "/admin/dashboard", icon: icons.dashboard },
    { label: "Tous les tickets", to: "/admin/tickets",   icon: icons.ticket },
    { label: "Utilisateurs",     to: "/admin/users",     icon: icons.users },
    { label: "Machines",         to: "/admin/machines",  icon: icons.machine },
    { label: "Rapports",         to: "/admin/reports",   icon: icons.report },
    { label: "Configuration",    to: "/admin/config",    icon: icons.config },
  ],
};

const ROLE_LABELS = {
  employee:   "Employé",
  technician: "Technicien",
  manager:    "Manager",
  admin:      "Administrateur",
};

const ROLE_COLORS = {
  employee:   { bg: "rgba(34,197,94,0.15)",  text: "#22c55e" },
  technician: { bg: "rgba(251,146,60,0.15)", text: "#fb923c" },
  manager:    { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  admin:      { bg: "rgba(37,99,235,0.2)",   text: "#60a5fa" },
};

// ── Déconnexion ───────────────────────────────────────────────────────────────
function handleLogout() {
  localStorage.clear();
  window.location.replace("/");
}

// ── Contenu sidebar ───────────────────────────────────────────────────────────
function SidebarContent({ user, navLinks, isOpen, location }) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.employee;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Logo */}
      <Box sx={{
        display: "flex", alignItems: "center",
        gap: isOpen ? 1.5 : 0,
        justifyContent: isOpen ? "flex-start" : "center",
        px: isOpen ? 2.5 : 1, py: 2.5, minHeight: 72,
      }}>
        <Box sx={{
          width: 38, height: 38, flexShrink: 0,
          background: "linear-gradient(135deg, #fff 0%, #e8f0fe 100%)",
          borderRadius: "10px", display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={SIDEBAR_ACCENT} strokeWidth="2.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </Box>
        {isOpen && (
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            Fix<span style={{ color: "#60a5fa" }}>Track</span>
          </Typography>
        )}
      </Box>

      {/* Profil */}
      {isOpen ? (
        <Box sx={{
          mx: 2, mb: 2, p: 1.5,
          background: "rgba(255,255,255,0.06)",
          borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <Avatar sx={{
            width: 38, height: 38, fontSize: 13, fontWeight: 700,
            background: `linear-gradient(135deg, ${SIDEBAR_ACCENT}, #3b82f6)`,
            boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
          }}>{initials}</Avatar>
          <Box sx={{ overflow: "hidden", flex: 1 }}>
            <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </Typography>
            <Chip
              label={ROLE_LABELS[user.role] || user.role}
              size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 600, backgroundColor: roleColor.bg, color: roleColor.text, "& .MuiChip-label": { px: 1 } }}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Tooltip title={user.name} placement="right">
            <Avatar sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${SIDEBAR_ACCENT}, #3b82f6)`, cursor: "pointer" }}>
              {initials}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      <Box sx={{ height: "1px", mx: 2, mb: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: 2 },
      }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Tooltip key={link.to} title={!isOpen ? link.label : ""} placement="right">
              <Box component={Link} to={link.to} sx={{
                display: "flex", alignItems: "center",
                gap: isOpen ? 1.5 : 0,
                justifyContent: isOpen ? "flex-start" : "center",
                px: isOpen ? 1.5 : 0, py: 1.1, mb: 0.5,
                borderRadius: "10px", textDecoration: "none", position: "relative",
                transition: "all 0.2s ease",
                backgroundColor: isActive ? alpha(SIDEBAR_ACCENT, 0.85) : "transparent",
                "&:hover": {
                  backgroundColor: isActive ? alpha(SIDEBAR_ACCENT, 0.9) : "rgba(255,255,255,0.07)",
                  transform: "translateX(2px)",
                },
                "&::before": isActive ? {
                  content: '""', position: "absolute", left: -6, top: "50%",
                  transform: "translateY(-50%)", width: 3, height: "60%",
                  backgroundColor: "#60a5fa", borderRadius: "0 4px 4px 0",
                } : {},
              }}>
                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {link.icon}
                </Box>
                {isOpen && (
                  <Typography sx={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: isActive ? "#fff" : "rgba(255,255,255,0.7)", whiteSpace: "nowrap", flex: 1 }}>
                    {link.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Footer déconnexion */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Box sx={{ height: "1px", mb: 1.5, backgroundColor: "rgba(255,255,255,0.08)" }} />
        <Tooltip title={!isOpen ? "Déconnexion" : ""} placement="right">
          <Box onClick={handleLogout} sx={{
            display: "flex", alignItems: "center",
            gap: isOpen ? 1.5 : 0,
            justifyContent: isOpen ? "flex-start" : "center",
            px: isOpen ? 1.5 : 0, py: 1.1,
            borderRadius: "10px", cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            transition: "all 0.2s",
            "&:hover": { backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171", transform: "translateX(2px)" },
          }}>
            {icons.logout}
            {isOpen && (
              <Typography sx={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
                Déconnexion
              </Typography>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function Layout({ children, pageTitle = "Tableau de bord", notifCount = 0 }) {
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet  = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isTablet);

  const user = JSON.parse(localStorage.getItem("currentUser")) || {
    name: "Utilisateur", role: "employee", email: "",
  };

  const navLinks = NAV_LINKS[user.role] || NAV_LINKS.employee;
  const allLinks = Object.values(NAV_LINKS).flat();
  const activeLink = allLinks.find((l) => l.to === location.pathname);
  const currentTitle = activeLink ? activeLink.label : pageTitle;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const sidebarWidth = isMobile ? 0 : sidebarOpen ? SIDEBAR_W_OPEN : SIDEBAR_W_MINI;

  const sidebarContent = (
    <SidebarContent
      user={user}
      navLinks={navLinks}
      isOpen={isMobile ? true : sidebarOpen}
      location={location}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F3F4F6" }}>

      {/* Sidebar desktop */}
      {!isMobile && (
        <Box component="aside" sx={{ width: sidebarWidth, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
          <Box sx={{
            position: "fixed", top: 0, left: 0, height: "100vh", width: sidebarWidth,
            overflow: "hidden", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
            background: `linear-gradient(180deg, #1a3558 0%, #1E3A5F 40%, #162d4a 100%)`,
            boxShadow: "4px 0 24px rgba(0,0,0,0.12)", zIndex: 200,
          }}>
            {sidebarContent}
          </Box>
        </Box>
      )}

      {/* Sidebar mobile */}
      {isMobile && (
        <Drawer
          variant="temporary" open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": {
            width: SIDEBAR_W_OPEN, border: "none",
            background: `linear-gradient(180deg, #1a3558 0%, #1E3A5F 40%, #162d4a 100%)`,
          }}}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5 }}>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "rgba(255,255,255,0.6)" }}>
              {icons.close}
            </IconButton>
          </Box>
          {sidebarContent}
        </Drawer>
      )}

      {/* Zone droite */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>

        {/* Topbar */}
        <AppBar position="sticky" elevation={0} sx={{
          backgroundColor: "#fff", borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)", zIndex: 100,
        }}>
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: "64px !important", gap: 2 }}>

            <IconButton
              onClick={() => isMobile ? setMobileOpen(true) : setSidebarOpen(!sidebarOpen)}
              size="small"
              sx={{ color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "8px", width: 36, height: 36,
                "&:hover": { backgroundColor: "#F3F4F6" } }}
            >
              {!isMobile && sidebarOpen ? icons.collapse : icons.menu}
            </IconButton>

            <Typography variant="h6" sx={{
              flex: 1, fontSize: { xs: 15, md: 17 }, fontWeight: 700,
              color: "#111827", letterSpacing: "-0.3px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {currentTitle}
            </Typography>

            {user.role === "employee" && (
              <Button component={Link} to="/employee/tickets/new" variant="contained" size="small"
                startIcon={icons.plus}
                sx={{ backgroundColor: SIDEBAR_ACCENT, borderRadius: "8px", textTransform: "none",
                  fontWeight: 600, fontSize: 13, px: 2, py: 0.9, whiteSpace: "nowrap",
                  display: { xs: "none", sm: "flex" },
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                  "&:hover": { backgroundColor: "#1d4ed8" } }}>
                Nouveau ticket
              </Button>
            )}

            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", width: 36, height: 36, color: "#6B7280" }}>
                <Badge badgeContent={notifCount} max={99} sx={{ "& .MuiBadge-badge": { backgroundColor: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, border: "2px solid #fff" } }}>
                  {icons.bell}
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={user.name}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: `linear-gradient(135deg, ${SIDEBAR_ACCENT}, #3b82f6)`,
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                "&:hover": { transform: "scale(1.05)" }, transition: "transform 0.2s" }}>
                {initials}
              </Avatar>
            </Tooltip>

          </Toolbar>
        </AppBar>

        {/* Contenu */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: "#F3F4F6", minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}