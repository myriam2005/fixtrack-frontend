// src/components/notifications/NotificationBell.jsx
// ─── Logique métier + rendu JSX ───────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Tooltip, Divider } from "@mui/material";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import {
  getIconColor, EVENT_LABEL,
  bellButtonSx, badgeSx, panelSx, headerSx, unreadBadgeSx,
  markAllBtnSx, listContainerSx, emptyStateSx, footerSx,
  itemWrapperSx, accentBarSx, iconBoxSx, labelSx,
  timestampSx, messageSx, unreadDotSx, removeButtonSx,
} from "../notification/NotificationBell.styles";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CheckAllIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EventIcon = ({ event, type }) => {
  const icons = {
    ticket_created: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
    ticket_assigned: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
      </svg>
    ),
    ticket_reassigned: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    ticket_resolved: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    ticket_closed: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    ticket_in_progress: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    ticket_critical: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };
  const fallbacks = { success: icons.ticket_resolved, warning: icons.ticket_critical, error: icons.ticket_critical, info: icons.ticket_created };
  return icons[event] || fallbacks[type] || icons.ticket_created;
};

// ─── Format date relative ─────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mn = Math.floor(diff / 60000);
  const h  = Math.floor(mn / 60);
  const d  = Math.floor(h / 24);
  if (mn < 1)   return "À l'instant";
  if (mn < 60)  return `Il y a ${mn} min`;
  if (h  < 24)  return `Il y a ${h}h`;
  if (d  === 1) return "Hier";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ─── Sous-composant : item de notification ────────────────────────────────────
function NotifItem({ notif, onRead, onRemove }) {
  const iconColor = getIconColor(notif.event, notif.type, notif.lu);
  const label     = EVENT_LABEL[notif.event] || EVENT_LABEL[notif.type] || "Notification";

  return (
    <Box
      onClick={() => !notif.lu && onRead(notif.id)}
      sx={{ ...itemWrapperSx, cursor: notif.lu ? "default" : "pointer" }}
    >
      {/* Barre latérale colorée */}
      <Box sx={accentBarSx(iconColor, notif.lu)} />

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, px: 2, py: 1.5, flex: 1 }}>
        {/* Icône */}
        <Box sx={iconBoxSx(iconColor, notif.lu)}>
          <EventIcon event={notif.event} type={notif.type} />
        </Box>

        {/* Texte */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.3 }}>
            <Typography sx={labelSx(iconColor, notif.lu)}>{label}</Typography>
            <Typography sx={timestampSx}>{timeAgo(notif.timestamp)}</Typography>
          </Box>
          <Typography sx={messageSx(notif.lu)}>{notif.message}</Typography>
        </Box>

        {/* Dot non-lu + supprimer */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, mt: 0.3, flexShrink: 0 }}>
          {!notif.lu && <Box sx={unreadDotSx(iconColor)} />}
          <IconButton
            className="remove-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onRemove(notif.id); }}
            sx={removeButtonSx}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function NotificationBell() {
  const { getNotificationsForUser, getUnreadCountForUser, markAllAsRead, markAsRead, removeNotification } =
    useNotifications();
  const { user } = useAuth();

  const userId        = user?.id;
  const notifications = userId ? getNotificationsForUser(userId) : [];
  const unreadCount   = userId ? getUnreadCountForUser(userId)   : 0;
  const readCount     = notifications.filter((n) => n.lu).length;

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <Box ref={ref} sx={{ position: "relative" }}>

      {/* ── Bouton cloche ── */}
      <Tooltip title="Notifications" placement="bottom">
        <IconButton onClick={() => setOpen((v) => !v)} size="small" sx={bellButtonSx(open)}>
          <BellIcon />
          {unreadCount > 0 && (
            <Box sx={badgeSx}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>

      {/* ── Panel dropdown ── */}
      {open && (
        <Box sx={panelSx}>

          {/* En-tête */}
          <Box sx={headerSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.1px" }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Box sx={unreadBadgeSx}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#FFF", lineHeight: 1.4 }}>
                    {unreadCount}
                  </Typography>
                </Box>
              )}
            </Box>

            {unreadCount > 0 && (
              <Box onClick={() => markAllAsRead(userId)} sx={markAllBtnSx}>
                <Box sx={{ color: "#475569", display: "flex" }}><CheckAllIcon /></Box>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#475569" }}>
                  Tout lire
                </Typography>
              </Box>
            )}
          </Box>

          {/* Liste */}
          <Box sx={listContainerSx}>
            {notifications.length === 0 ? (
              <Box sx={emptyStateSx}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5, color: "#CBD5E1" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
                  Aucune notification
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#CBD5E1", mt: 0.5 }}>
                  Vous êtes à jour
                </Typography>
              </Box>
            ) : (
              notifications.map((notif, idx) => (
                <Box key={notif.id}>
                  {idx > 0 && <Divider sx={{ mx: 0, borderColor: "#F1F5F9" }} />}
                  <NotifItem notif={notif} onRead={markAsRead} onRemove={removeNotification} />
                </Box>
              ))
            )}
          </Box>

          {/* Pied */}
          {notifications.length > 0 && (
            <Box sx={footerSx}>
              <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                {notifications.length} notification{notifications.length > 1 ? "s" : ""}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#CBD5E1" }}>
                {readCount} lue{readCount > 1 ? "s" : ""}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}