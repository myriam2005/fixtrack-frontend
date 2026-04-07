// src/components/common/notification/NotificationItem.jsx
// ✅ Bouton quick-assign visible UNIQUEMENT pour manager/admin
//    — le rôle est lu depuis AuthContext
//    — admin reçoit la notif sans bouton (info seulement)
//    — technicien ne voit jamais le bouton

import { useNavigate }        from "react-router-dom";
import { useAuth }            from "../../../context/AuthContext";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const IcoTicket = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="11" x2="12" y2="17"/>
    <line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);
const IcoAssign = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);
const IcoResolve = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoCritical = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IcoRefused = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const IcoProfile = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoArrowRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Config type → icône + alertColor ─────────────────────────────────────────
const TYPE_MAP = {
  ticket_created:    { Icon: IcoTicket,   alertColor: null      },
  ticket_assigned:   { Icon: IcoAssign,   alertColor: null      },
  ticket_reassigned: { Icon: IcoAssign,   alertColor: null      },
  ticket_resolved:   { Icon: IcoResolve,  alertColor: null      },
  ticket_validated:  { Icon: IcoResolve,  alertColor: null      },
  ticket_critical:   { Icon: IcoCritical, alertColor: "#DC2626" },
  ticket_deleted:    { Icon: IcoTicket,   alertColor: null      },
  ticket_refused:    { Icon: IcoRefused,  alertColor: "#DC2626" },
  profile_updated:   { Icon: IcoProfile,  alertColor: null      },
  status_changed:    { Icon: IcoRefresh,  alertColor: null      },
  warning:           { Icon: IcoCritical, alertColor: "#D97706" },
  error:             { Icon: IcoRefused,  alertColor: "#DC2626" },
  info:              { Icon: IcoTicket,   alertColor: null      },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function NotificationItem({ notif, onMarkRead }) {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const currentRole  = user?.role || "";

  const type       = notif.type || "status_changed";
  const isRead     = !!notif.lu;
  const config     = TYPE_MAP[type] || TYPE_MAP.status_changed;
  const { Icon, alertColor } = config;

  const isRefused  = type === "ticket_refused";
  const isCritical = type === "ticket_critical";
  const isAlert    = !isRead && !!alertColor;

  // ✅ Bouton quick-assign UNIQUEMENT pour manager
  // admin reçoit la notif mais sans bouton (info seulement)
  // technician et user ne voient jamais ce bouton
  const canReassign = currentRole === "manager";
  const hasReassign = isRefused && !isRead && canReassign &&
    notif.meta?.action === "reassign" && notif.meta?.ticketId;

  const iconColor  = isRead ? "#CBD5E1" : isAlert ? alertColor  : "#64748B";
  const iconBg     = isRead ? "#F8FAFC" : isAlert ? `${alertColor}12` : "#F1F5F9";
  const iconBorder = isRead ? "#F1F5F9" : isAlert ? `${alertColor}30` : "#E2E8F0";
  const leftBorder = isRead
    ? "2.5px solid transparent"
    : isAlert ? `2.5px solid ${alertColor}60` : "2.5px solid #BFDBFE";

  const handleClick = () => {
    if (!isRead && onMarkRead) onMarkRead(notif._id || notif.id);
  };

  const handleReassign = (e) => {
    e.stopPropagation();
    if (!isRead && onMarkRead) onMarkRead(notif._id || notif.id);
    navigate(`/manager/tickets?ticketId=${notif.meta.ticketId}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        gap: 10,
        padding: "11px 16px 12px",
        background: isRead ? "transparent" : isAlert ? `${alertColor}06` : "#FAFBFF",
        borderLeft: leftBorder,
        cursor: isRead ? "default" : "pointer",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      {/* Icône */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 1,
        background: iconBg, border: `1px solid ${iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: iconColor,
      }}>
        <Icon />
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: "0 0 3px",
          fontSize: 12.5,
          color: isRead ? "#94A3B8" : "#0F172A",
          lineHeight: 1.45,
          fontWeight: isRead ? 400 : 500,
          paddingRight: 18,
        }}>
          {notif.message}
        </p>

        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          marginBottom: (hasReassign || (isRefused && notif.meta?.reason)) ? 8 : 0,
        }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>{timeAgo(notif.createdAt || notif.timestamp)}</span>
          {!isRead && (
            <span style={{ fontSize: 10, fontWeight: 600, color: isAlert ? alertColor : "#3B82F6", letterSpacing: "0.02em" }}>
              · {isRefused ? "Refus" : isCritical ? "Critique" : "Nouveau"}
            </span>
          )}
        </div>

        {/* Motif du refus — discret */}
        {isRefused && notif.meta?.reason && (
          <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#64748B", lineHeight: 1.5, fontStyle: "italic" }}>
            "{notif.meta.reason}"
          </p>
        )}

        {/* ✅ Bouton quick-assign — manager seulement */}
        {hasReassign && (
          <button
            onClick={handleReassign}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 6,
              border: "1px solid #E2E8F0",
              backgroundColor: "#fff", color: "#374151",
              fontSize: 11.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.color = "#2563EB";
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            <IcoAssign />
            Réassigner
            <IcoArrowRight />
          </button>
        )}
      </div>

      {/* Point non-lu */}
      {!isRead && (
        <div style={{
          position: "absolute", top: 13, right: 14,
          width: 6, height: 6, borderRadius: "50%",
          background: isAlert ? alertColor : "#3B82F6",
        }} />
      )}
    </div>
  );
}