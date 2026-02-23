import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// ─── Icônes SVG inline (pas d'emojis) ────────────────────────────────────────
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  machine: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  report: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  config: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── Navigation selon le rôle ─────────────────────────────────────────────────
const NAV_LINKS = {
  employee: [
    { label: "Tableau de bord", to: "/employee/dashboard",   icon: icons.dashboard },
    { label: "Mes tickets",     to: "/employee/tickets",     icon: icons.ticket },
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

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Layout({ children, pageTitle = "Tableau de bord", notifCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Lecture de l'utilisateur connecté depuis le localStorage
  const user = JSON.parse(localStorage.getItem("currentUser")) || {
    name: "Utilisateur",
    role: "employee",
    email: "",
  };

  const navLinks = NAV_LINKS[user.role] || NAV_LINKS.employee;

  // Titre automatique selon la route active
  const allLinks = Object.values(NAV_LINKS).flat();
  const activeLink = allLinks.find((l) => l.to === location.pathname);
  const currentTitle = activeLink ? activeLink.label : pageTitle;

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Initiales de l'utilisateur pour l'avatar
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div style={styles.root}>
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? 256 : 72,
          transition: "width 0.25s ease",
        }}
      >
        {/* Logo + nom app */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            {sidebarOpen && <span style={styles.logoText}>FixTrack</span>}
          </div>
          <button
            style={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Réduire" : "Agrandir"}
          >
            {icons.menu}
          </button>
        </div>

        {/* Profil utilisateur */}
        {sidebarOpen && (
          <div style={styles.userBox}>
            <div style={styles.avatarSmall}>{initials}</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>{ROLE_LABELS[user.role] || user.role}</span>
            </div>
          </div>
        )}

        {/* Séparateur */}
        <div style={styles.divider} />

        {/* Navigation */}
        <nav style={styles.nav}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
                title={!sidebarOpen ? link.label : undefined}
              >
                <span style={{ ...styles.navIcon, color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.65)" }}>
                  {link.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ ...styles.navLabel, color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)" }}>
                    {link.label}
                  </span>
                )}
                {sidebarOpen && isActive && (
                  <span style={{ marginLeft: "auto", opacity: 0.7 }}>{icons.chevronRight}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bouton déconnexion (en bas) */}
        <div style={styles.sidebarFooter}>
          <div style={styles.divider} />
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <span style={styles.navIcon}>{icons.logout}</span>
            {sidebarOpen && <span style={styles.navLabel}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── ZONE DROITE ── */}
      <div style={styles.rightZone}>

        {/* ── TOPBAR / HEADER ── */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <h1 style={styles.pageTitle}>{currentTitle}</h1>
          </div>
          <div style={styles.topbarRight}>
            {/* Bouton Nouveau ticket — employee uniquement */}
            {user.role === "employee" && (
              <Link to="/employee/tickets/new" style={{ textDecoration: "none" }}>
                <button style={styles.newTicketBtn}>
                  <span style={{ display: "flex", alignItems: "center" }}>{icons.plus}</span>
                  Nouveau ticket
                </button>
              </Link>
            )}
            {/* Cloche de notifications */}
            <button style={styles.bellBtn} title="Notifications">
              {icons.bell}
              {notifCount > 0 && (
                <span style={styles.badge}>{notifCount > 99 ? "99+" : notifCount}</span>
              )}
            </button>
            {/* Avatar utilisateur */}
            <div style={styles.topbarAvatar} title={user.name}>
              {initials}
            </div>
          </div>
        </header>

        {/* ── CONTENU PRINCIPAL ── */}
        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },

  // Sidebar
  sidebar: {
    backgroundColor: "#1E3A5F",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 100,
    overflow: "hidden",
    boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 16px 16px",
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.3px",
    whiteSpace: "nowrap",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 16px 12px",
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    whiteSpace: "nowrap",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: "4px 16px",
  },

  // Navigation
  nav: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 10px",
    gap: 2,
    flex: 1,
    overflowY: "auto",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    textDecoration: "none",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
  navLinkActive: {
    backgroundColor: "rgba(37, 99, 235, 0.9)",
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: 500,
  },

  // Footer sidebar
  sidebarFooter: {
    padding: "0 10px 16px",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 12px",
    background: "none",
    border: "none",
    borderRadius: 8,
    color: "rgba(255,255,255,0.65)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  },

  // Zone droite
  rightZone: {
    flex: 1,
    marginLeft: 256, // ajuster dynamiquement si besoin
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    transition: "margin-left 0.25s ease",
  },

  // Topbar
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    height: 64,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  topbarLeft: {},
  pageTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "-0.2px",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  newTicketBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  bellBtn: {
    position: "relative",
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#6B7280",
    transition: "border-color 0.15s, color 0.15s",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    border: "2px solid #FFFFFF",
  },
  topbarAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Contenu
  main: {
    flex: 1,
    padding: "28px",
    backgroundColor: "#F3F4F6",
  },
};