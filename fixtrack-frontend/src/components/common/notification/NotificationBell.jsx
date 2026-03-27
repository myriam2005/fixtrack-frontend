// src/components/common/notification/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Tooltip, Divider } from "@mui/material";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import {
  bellButtonSx, badgeSx, panelSx, headerSx,
  unreadBadgeSx, markAllBtnSx, listContainerSx,
  emptyStateSx, footerSx,
} from "./NotificationBell.styles";
import NotificationItem from "./NotificationItem";

// ── Icônes ────────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CheckAllIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

// ── NotifItem wrapper avec bouton supprimer au survol ─────────────────────────
function NotifItem({ notif, onRead, onRemove }) {
  const adaptedNotif = {
    _id:       notif.id,
    type:      notif.event || notif.type,
    message:   notif.message,
    createdAt: notif.timestamp,
    lu:        notif.lu,
    meta:      notif.meta,
  };

  return (
    <Box
      sx={{
        position: "relative",
        "&:hover .nb-delete": { opacity: 1, visibility: "visible" },
      }}
    >
      <NotificationItem
        notif={adaptedNotif}
        onMarkRead={(id) => onRead && onRead(id)}
      />

      {/* Bouton supprimer — petit, discret, visible au hover */}
      <IconButton
        className="nb-delete"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onRemove && onRemove(notif.id);
        }}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 22,
          height: 22,
          opacity: 0,
          visibility: "hidden",
          transition: "opacity 0.15s, visibility 0.15s",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "6px",
          color: "#94A3B8",
          "&:hover": {
            backgroundColor: "#FEF2F2",
            borderColor: "#FECACA",
            color: "#DC2626",
          },
          zIndex: 10,
        }}
      >
        <TrashIcon />
      </IconButton>
    </Box>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function NotificationBell() {
  const {
    getNotificationsForUser,
    getUnreadCountForUser,
    markAllAsRead,
    markAsRead,
    removeNotification,
  } = useNotifications();
  const { user } = useAuth();

  const userId        = user?.id;
  const notifications = userId ? getNotificationsForUser(userId) : [];
  const unreadCount   = userId ? getUnreadCountForUser(userId) : 0;
  const readCount     = notifications.filter((n) => n.lu).length;

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <Box ref={ref} sx={{ position: "relative" }}>
      <Tooltip title="Notifications" placement="bottom">
        <IconButton
          onClick={() => setOpen((v) => !v)}
          size="small"
          sx={bellButtonSx(open)}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <Box sx={badgeSx}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>

      {open && (
        <Box sx={panelSx}>

          {/* Header */}
          <Box sx={headerSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.15px" }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Box sx={unreadBadgeSx}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#FFF", lineHeight: 1, px: 0.5 }}>
                    {unreadCount}
                  </Typography>
                </Box>
              )}
            </Box>

            {unreadCount > 0 && (
              <Box onClick={() => markAllAsRead(userId)} sx={markAllBtnSx}>
                <Box sx={{ color: "#64748B", display: "flex" }}>
                  <CheckAllIcon />
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#64748B" }}>
                  Tout lire
                </Typography>
              </Box>
            )}
          </Box>

          {/* Liste */}
          <Box sx={listContainerSx}>
            {notifications.length === 0 ? (
              <Box sx={emptyStateSx}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5, color: "#E2E8F0" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
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
                  {idx > 0 && (
                    <Divider sx={{ borderColor: "#F1F5F9" }} />
                  )}
                  <NotifItem
                    notif={notif}
                    onRead={markAsRead}
                    onRemove={removeNotification}
                  />
                </Box>
              ))
            )}
          </Box>

          {/* Footer */}
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