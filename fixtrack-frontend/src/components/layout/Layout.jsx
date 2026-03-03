// src/components/layout/Layout.jsx
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Box, Typography, IconButton, Avatar, Tooltip,
  Badge, useTheme, useMediaQuery, Drawer, alpha,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import AccountSettingsModal from "./AccountSettingsModal";

const Ico = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  ticket:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>,
  plus:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  machine:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  report:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  team:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  config:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  logout:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  wrench:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  chevron:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  settings:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

const NAV = {
  employee: [
    { label: "Tableau de bord", to: "/employee/dashboard", icon: Ico.dashboard },
    { label: "Mes tickets",     to: "/employee/tickets",   icon: Ico.ticket    },
  ],
  technician: [
    { label: "Tableau de bord",  to: "/technician/dashboard", icon: Ico.dashboard },
    { label: "Tickets assignés", to: "/technician/tickets",   icon: Ico.ticket    },
    { label: "Rapports",         to: "/technician/reports",   icon: Ico.report    },
  ],
  manager: [
    { label: "Tableau de bord",      to: "/manager/dashboard",   icon: Ico.dashboard },
    { label: "Tous les tickets",     to: "/manager/tickets",     icon: Ico.ticket    },
    { label: "Valider résolutions",  to: "/manager/resolutions", icon: Ico.wrench    },
    { label: "Équipe",               to: "/manager/team",        icon: Ico.team      },
    { label: "Rapports",             to: "/manager/reports",     icon: Ico.report    },
  ],
  admin: [
    { label: "Tableau de bord",  to: "/admin/dashboard", icon: Ico.dashboard },
    { label: "Tous les tickets", to: "/admin/tickets",   icon: Ico.ticket    },
    { label: "Utilisateurs",     to: "/admin/users",     icon: Ico.users     },
    { label: "Machines",         to: "/admin/machines",  icon: Ico.machine   },
    { label: "Rapports",         to: "/admin/reports",   icon: Ico.report    },
    { label: "Configuration",    to: "/admin/config",    icon: Ico.config    },
  ],
};

const ROLE_META = {
  employee:   { label: "Employé",        color: "#059669", bg: "#ECFDF5", dot: "#10b981" },
  technician: { label: "Technicien",     color: "#d97706", bg: "#FFFBEB", dot: "#f59e0b" },
  manager:    { label: "Manager",        color: "#7c3aed", bg: "#F5F3FF", dot: "#8b5cf6" },
  admin:      { label: "Administrateur", color: "#1d4ed8", bg: "#EFF6FF", dot: "#3b82f6" },
};

const T = {
  accent:      "#2563EB",
  accentHover: "#1d4ed8",
  accentLight: "#EFF6FF",
  sidebar:     "#FFFFFF",
  topbar:      "#FFFFFF",
  bg:          "#F8FAFC",
  border:      "#E2E8F0",
  borderLight: "#F1F5F9",
  text:        "#0F172A",
  textSub:     "#475569",
  textMuted:   "#94A3B8",
  sideW:       252,
};

function NavItem({ link, isActive }) {
  return (
    <Box
      component={Link}
      to={link.to}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 1.5, py: 0.95, mx: 1, mb: 0.25,
        borderRadius: "9px", textDecoration: "none",
        backgroundColor: isActive ? T.accentLight : "transparent",
        color: isActive ? "#1e40af" : T.textSub,
        borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
        transition: "all 0.14s ease",
        "&:hover": {
          backgroundColor: isActive ? T.accentLight : T.borderLight,
          color: isActive ? "#1e40af" : T.text,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: isActive ? T.accent : T.textMuted }}>
        {link.icon}
      </Box>
      <Typography sx={{ fontSize: 13.5, flex: 1, fontWeight: isActive ? 600 : 400, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {link.label}
      </Typography>
      {isActive && (
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: T.accent, flexShrink: 0, mr: 0.5 }} />
      )}
    </Box>
  );
}

function SidebarContent({ user, navLinks, location, onLogout, onOpenSettings }) {
  const role     = ROLE_META[user.role] || ROLE_META.employee;
  const initials = user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, height: 64, flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
        <Box sx={{
          width: 33, height: 33, borderRadius: "9px", flexShrink: 0,
          background: `linear-gradient(135deg, ${T.accent} 0%, #1d4ed8 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 2px 10px ${alpha(T.accent, 0.35)}`,
        }}>
          <Box sx={{ color: "#fff", display: "flex", transform: "scale(0.82)" }}>{Ico.wrench}</Box>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: T.text, letterSpacing: "-0.4px", lineHeight: 1.1 }}>
            Fix<span style={{ color: T.accent }}>Track</span>
          </Typography>
          <Typography sx={{ fontSize: 10, color: T.textMuted, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1 }}>
            Maintenance
          </Typography>
        </Box>
      </Box>

      {/* Carte profil */}
      <Box sx={{
        mx: 1.5, mt: 2, mb: 1.5, px: 1.5, py: 1.25,
        borderRadius: "11px", backgroundColor: T.borderLight,
        border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0,
      }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar sx={{ width: 36, height: 36, fontSize: 12, fontWeight: 700, backgroundColor: T.accent }}>
            {initials}
          </Avatar>
          <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e", border: `2px solid ${T.borderLight}` }} />
        </Box>
        <Box sx={{ overflow: "hidden", flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.name}
          </Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 0.75, py: 0.2, mt: 0.4, borderRadius: "4px", backgroundColor: role.bg }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: role.dot }} />
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: role.color, lineHeight: 1 }}>{role.label}</Typography>
          </Box>
        </Box>
        <Tooltip title="Paramètres du compte" placement="right">
          <IconButton onClick={onOpenSettings} size="small" sx={{
            width: 28, height: 28, flexShrink: 0, color: T.textMuted, borderRadius: "7px",
            border: "1px solid transparent", transition: "all 0.15s",
            "&:hover": { color: T.accent, backgroundColor: T.accentLight, border: `1px solid ${alpha(T.accent, 0.25)}` },
          }}>
            {Ico.settings}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Label section */}
      <Box sx={{ px: 2.5, pb: 0.75, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Menu
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", pb: 1, "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { backgroundColor: T.border, borderRadius: 2 } }}>
        {navLinks.map(link => (
          <NavItem key={link.to} link={link} isActive={location.pathname === link.to} />
        ))}
      </Box>

      {/* Déconnexion */}
      <Box sx={{ borderTop: `1px solid ${T.border}`, px: 1, py: 1.25, flexShrink: 0 }}>
        <Box
          onClick={onLogout}
          role="button" tabIndex={0}
          sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            px: 1.5, py: 1, borderRadius: "9px",
            cursor: "pointer", color: T.textMuted, transition: "all 0.14s",
            "&:hover": { backgroundColor: "#FEF2F2", color: "#DC2626" },
          }}
        >
          {Ico.logout}
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Déconnexion</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Layout({ children, notifCount = 0 }) {
  const location = useLocation();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user: ctxUser, logout } = useAuth();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const user     = ctxUser || { name: "Utilisateur", role: "employee", email: "" };
  const navLinks = NAV[user.role] || NAV.employee;
  const allLinks = Object.values(NAV).flat();
  const active   = allLinks.find(l => l.to === location.pathname);
  const initials = user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const handleLogout        = () => { logout(); window.location.replace("/login"); };
  const handleOpenSettings  = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);

  const sidebarNode = (
    <SidebarContent
      user={user} navLinks={navLinks} location={location}
      onLogout={handleLogout} onOpenSettings={handleOpenSettings}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: T.bg }}>

      {/* Sidebar desktop */}
      {!isMobile && (
        <Box sx={{
          width: T.sideW, flexShrink: 0,
          position: "fixed", top: 0, left: 0, height: "100vh",
          backgroundColor: T.sidebar, borderRight: `1px solid ${T.border}`,
          boxShadow: "2px 0 16px rgba(15,23,42,0.04)", zIndex: 200,
        }}>
          {sidebarNode}
        </Box>
      )}

      {/* Drawer mobile */}
      {isMobile && (
        <Drawer
          variant="temporary" open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: T.sideW, backgroundColor: T.sidebar, border: "none", boxShadow: "4px 0 24px rgba(15,23,42,0.1)" } }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1.5, pt: 1.5 }}>
            <IconButton onClick={() => setMobileOpen(false)} size="small" sx={{ color: T.textMuted }}>{Ico.close}</IconButton>
          </Box>
          {sidebarNode}
        </Drawer>
      )}

      {/* Zone principale */}
      <Box sx={{ flex: 1, ml: isMobile ? 0 : `${T.sideW}px`, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>

        {/* Topbar */}
        <Box component="header" sx={{
          position: "sticky", top: 0, zIndex: 100, height: 64,
          backgroundColor: T.topbar, borderBottom: `1px solid ${T.border}`,
          boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
          display: "flex", alignItems: "center",
          px: { xs: 2, md: 3 }, gap: 2,
        }}>
          {isMobile && (
            <Tooltip title="Menu">
              <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{
                width: 36, height: 36, borderRadius: "8px",
                border: `1px solid ${T.border}`, color: T.textSub,
                "&:hover": { borderColor: T.accent, color: T.accent, backgroundColor: T.accentLight },
              }}>
                {Ico.menu}
              </IconButton>
            </Tooltip>
          )}

          {/* Breadcrumb */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
            <Typography sx={{ fontSize: 12, color: T.textMuted, whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>FixTrack</Typography>
            {active && (
              <>
                <Box sx={{ color: T.textMuted, display: { xs: "none", sm: "flex" }, opacity: 0.5 }}>{Ico.chevron}</Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {active.label}
                </Typography>
              </>
            )}
          </Box>

          {/* Cloche */}
          <Tooltip title={notifCount > 0 ? `${notifCount} notification${notifCount > 1 ? "s" : ""}` : "Aucune notification"}>
            <IconButton size="small" sx={{
              width: 36, height: 36, borderRadius: "8px",
              border: `1px solid ${notifCount > 0 ? alpha(T.accent, 0.3) : T.border}`,
              color: notifCount > 0 ? T.accent : T.textMuted,
              backgroundColor: notifCount > 0 ? T.accentLight : "transparent",
              "&:hover": { borderColor: T.accent, backgroundColor: T.accentLight, color: T.accent },
              transition: "all 0.14s",
            }}>
              <Badge badgeContent={notifCount} max={99} sx={{ "& .MuiBadge-badge": { backgroundColor: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, border: "2px solid #fff" } }}>
                {Ico.bell}
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Paramètres */}
          <Tooltip title="Paramètres du compte">
            <IconButton onClick={handleOpenSettings} size="small" sx={{
              width: 36, height: 36, borderRadius: "8px",
              border: `1px solid ${T.border}`, color: T.textSub,
              "&:hover": { borderColor: T.accent, color: T.accent, backgroundColor: T.accentLight },
              transition: "all 0.14s",
            }}>
              {Ico.settings}
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pl: 1.5, borderLeft: `1px solid ${T.border}` }}>
            <Tooltip title="Paramètres du compte">
              <Avatar onClick={handleOpenSettings} sx={{
                width: 32, height: 32, fontSize: 11, fontWeight: 700,
                backgroundColor: T.accent, flexShrink: 0, cursor: "pointer",
                "&:hover": { boxShadow: `0 0 0 3px ${alpha(T.accent, 0.25)}` },
              }}>
                {initials}
              </Avatar>
            </Tooltip>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 10, color: T.textMuted, lineHeight: 1.2 }}>{user.email}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Contenu principal */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 3.5 }, minWidth: 0 }}>
          {children}
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 11, color: T.textMuted }}>© 2025 FixTrack</Typography>
          <Typography sx={{ fontSize: 11, color: T.textMuted }}>v1.0</Typography>
        </Box>
      </Box>

      {/* ── FAB Nouveau ticket — employee uniquement, toutes les pages ── */}
      {user.role === "employee" && (
        <Box
          component={Link}
          to="/employee/tickets/new"
          sx={{
            position: "fixed", bottom: 28, right: 32, zIndex: 1400,
            display: "flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF", borderRadius: "14px", padding: "12px 22px",
            fontWeight: 700, fontSize: "14px", fontFamily: "'Inter', sans-serif",
            textDecoration: "none", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(37,99,235,0.45), 0 2px 6px rgba(0,0,0,0.15)",
            transition: "transform 0.15s, box-shadow 0.15s",
            "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 28px rgba(37,99,235,0.55)" },
            "&:active": { transform: "translateY(0)" },
          }}
        >
          {Ico.plus}
          Nouveau ticket
        </Box>
      )}

      <AccountSettingsModal open={settingsOpen} onClose={handleCloseSettings} user={user} />
    </Box>
  );
}