// src/components/common/notification/NotificationItem.jsx
import { useNavigate } from "react-router-dom";

// ── Icônes SVG ─────────────────────────────────────────────────────────────────
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

// ── Map type → icône ───────────────────────────────────────────────────────────
const ICON_MAP = {
  ticket_created:    IcoTicket,
  ticket_assigned:   IcoAssign,
  ticket_reassigned: IcoAssign,
  ticket_resolved:   IcoResolve,
  ticket_validated:  IcoResolve,
  ticket_critical:   IcoCritical,
  ticket_deleted:    IcoTicket,
  ticket_refused:    IcoRefused,
  status_changed:    IcoRefresh,
  success:           IcoResolve,
  warning:           IcoCritical,
  error:             IcoRefused,
  info:              IcoTicket,
};

// ── Seuls types qui méritent une couleur d'alerte ─────────────────────────────
const ALERT_TYPES = {
  ticket_critical: { icon: "#DC2626", iconBg: "#FEF2F2", iconBorder: "#FECACA" },
  ticket_refused:  { icon: "#DC2626", iconBg: "#FEF2F2", iconBorder: "#FECACA" },
  warning:         { icon: "#D97706", iconBg: "#FFFBEB", iconBorder: "#FDE68A" },
  error:           { icon: "#DC2626", iconBg: "#FEF2F2", iconBorder: "#FECACA" },
};

// Tous les autres types → gris neutre
const NEUTRAL = { icon: "#64748B", iconBg: "#F8FAFC", iconBorder: "#E2E8F0" };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function NotificationItem({ notif, onMarkRead }) {
  const navigate    = useNavigate();
  const type        = notif.type || "status_changed";
  const isRead      = !!notif.lu;
  const IconComp    = ICON_MAP[type] || IcoRefresh;
  const isRefused   = type === "ticket_refused";
  const isCritical  = type === "ticket_critical";
  const isAlert     = !isRead && (isRefused || isCritical);
  const hasReassign = isRefused && notif.meta?.action === "reassign" && notif.meta?.ticketId;

  // Icône : couleur seulement pour alertes non-lues, gris sinon
  const iconStyle = isRead
    ? { icon: "#CBD5E1", iconBg: "#F8FAFC", iconBorder: "#F1F5F9" }
    : (ALERT_TYPES[type] || NEUTRAL);

  const handleClick = () => {
    if (!isRead && onMarkRead) onMarkRead(notif._id);
  };

  const handleReassign = (e) => {
    e.stopPropagation();
    if (!isRead && onMarkRead) onMarkRead(notif._id);
    navigate(`/manager/tickets?ticketId=${notif.meta.ticketId}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        gap: 10,
        padding: "11px 16px 12px",
        // Fond très légèrement teinté uniquement pour les alertes non-lues
        background: isRead
          ? "transparent"
          : isAlert ? "#FFFCFC" : "#FAFBFF",
        cursor: isRead ? "default" : "pointer",
        transition: "background 0.15s",
        position: "relative",
        // Trait gauche bleu pour non-lu standard, rouge pour alerte
        borderLeft: `2.5px solid ${
          isRead    ? "transparent" :
          isAlert   ? "#FECACA"    : "#BFDBFE"
        }`,
      }}
    >
      {/* Icône : neutre par défaut, colorée seulement si alerte */}
      <div style={{
        width: 30, height: 30,
        borderRadius: 8,
        backgroundColor: iconStyle.iconBg,
        border: `1px solid ${iconStyle.iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        color: iconStyle.icon,
        marginTop: 1,
      }}>
        <IconComp />
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Message */}
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

        {/* Timestamp + label type */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: (hasReassign || notif.meta?.reason) ? 8 : 0 }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>
            {timeAgo(notif.createdAt)}
          </span>
          {!isRead && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: isAlert ? "#B91C1C" : "#3B82F6",
              letterSpacing: "0.02em",
            }}>
              · {isRefused ? "Refus" : isCritical ? "Critique" : "Nouveau"}
            </span>
          )}
        </div>

        {/* Motif du refus — texte simple, pas de boîte rouge */}
        {isRefused && notif.meta?.reason && (
          <p style={{
            margin: "0 0 8px",
            fontSize: 11.5,
            color: "#64748B",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}>
            "{notif.meta.reason}"
          </p>
        )}

        {/* CTA Réassigner — bouton solide, texte explicite */}
        {hasReassign && !isRead && (
          <button
            onClick={handleReassign}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              borderRadius: 6,
              border: "1px solid #1D4ED8",
              backgroundColor: "#1D4ED8",
              color: "#FFFFFF",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
              e.currentTarget.style.borderColor = "#1E40AF";
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = "#1D4ED8";
              e.currentTarget.style.borderColor = "#1D4ED8";
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <polyline points="16 11 18 13 22 9"/>
            </svg>
            Assigner à un autre technicien
          </button>
        )}
      </div>

      {/* Point non-lu — bleu standard, rouge si alerte */}
      {!isRead && (
        <div style={{
          position: "absolute",
          top: 13, right: 14,
          width: 6, height: 6,
          borderRadius: "50%",
          backgroundColor: isAlert ? "#EF4444" : "#3B82F6",
        }} />
      )}
    </div>
  );
}