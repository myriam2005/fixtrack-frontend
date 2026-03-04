// src/pages/tech/TicketCard.jsx
import { useState } from "react";
import Badge  from "../../../components/common/badge/Badge";
import Modal  from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import { STRIPE_CLASS, formatDate } from "./ticketsUtils";

// ── Banners par catégorie ─────────────────────────────────────────────────────
const BANNER_BG = {
  HVAC:         "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
  Électrique:   "linear-gradient(135deg, #1a1a2e 0%, #F97316 100%)",
  Informatique: "linear-gradient(135deg, #0f172a 0%, #6366F1 100%)",
  Mécanique:    "linear-gradient(135deg, #1c1917 0%, #78716C 100%)",
  Plomberie:    "linear-gradient(135deg, #0c4a6e 0%, #0EA5E9 100%)",
  Sécurité:     "linear-gradient(135deg, #1a1a1a 0%, #EF4444 100%)",
};

const BADGE_MAP = {
  in_progress: { label: "En cours",   cls: ""         },
  assigned:    { label: "Assigné",    cls: "assigned"  },
  pending:     { label: "En attente", cls: "pending"   },
  resolved:    { label: "Résolu",     cls: "resolved"  },
  closed:      { label: "Clôturé",    cls: "resolved"  },
  refused:     { label: "Refusé",     cls: "refused"   },
};

const STATUS_DOT = {
  in_progress: "#F59E0B",
  assigned:    "#6366F1",
  pending:     "#F59E0B",
  resolved:    "#10B981",
  closed:      "#6B7280",
  refused:     "#DC2626",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoPin     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPause   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IcoPlay    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoX       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoAlert   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

// ── Resolve modal ─────────────────────────────────────────────────────────────
function ResolveModal({ ticket, onClose, onConfirm }) {
  const [solution, setSolution] = useState("");
  const [error,    setError]    = useState("");

  const handleConfirm = () => {
    if (!solution.trim()) { setError("La solution est obligatoire."); return; }
    onConfirm(solution.trim());
    setSolution(""); setError("");
  };
  const handleClose = () => { setSolution(""); setError(""); onClose(); };

  return (
    <Modal open={!!ticket} onClose={handleClose} title="Marquer comme résolu">
      {ticket && (
        <div className="ta-modal-body">
          <div className="ta-modal-info">
            <strong>{ticket.titre}</strong><br />
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{ticket.localisation}</span>
          </div>
          <div>
            <label className="ta-modal-label">
              Solution apportée <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              className={`ta-modal-ta${error ? " err" : ""}`}
              placeholder="Décrivez la solution : actions effectuées, pièces remplacées, résultat constaté…"
              value={solution}
              onChange={e => { setSolution(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <div className="ta-modal-err">{error}</div>}
          </div>
          <div className="ta-modal-actions">
            <Button label="Annuler"              variant="secondary" onClick={handleClose}   />
            <Button label="Confirmer résolution" variant="primary"   onClick={handleConfirm} />
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Refuse modal ──────────────────────────────────────────────────────────────
function RefuseModal({ ticket, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error,  setError]  = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) { setError("Le motif de refus est obligatoire."); return; }
    onConfirm(reason.trim());
    setReason(""); setError("");
  };
  const handleClose = () => { setReason(""); setError(""); onClose(); };

  return (
    <Modal open={!!ticket} onClose={handleClose} title="Refuser ce ticket">
      {ticket && (
        <div className="ta-modal-body">
          {/* Warning info */}
          <div className="ta-modal-info ta-modal-warn">
            <strong>⚠ Le ticket sera libéré pour réassignation</strong><br />
            Le manager sera notifié et pourra assigner ce ticket à un autre technicien.
          </div>

          {/* Ticket recap */}
          <div className="ta-modal-info">
            <strong>{ticket.titre}</strong><br />
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{ticket.localisation} · {ticket.categorie}</span>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="ta-modal-label">
              Motif du refus <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              className={`ta-modal-ta refuse-mode${error ? " err" : ""}`}
              placeholder="Ex. : Compétence non disponible, planning surchargé, matériel manquant…"
              value={reason}
              onChange={e => { setReason(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <div className="ta-modal-err">{error}</div>}
          </div>

          <div className="ta-modal-actions">
            <Button label="Annuler"         variant="secondary" onClick={handleClose}   />
            <Button label="Confirmer refus" variant="danger"    onClick={handleConfirm} />
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── TicketCard ────────────────────────────────────────────────────────────────
export default function TicketCard({ ticket, onAccept, onHold, onResolve, onRefuse }) {
  const [showResolve, setShowResolve] = useState(false);
  const [showRefuse,  setShowRefuse]  = useState(false);

  const { titre, description, priorite, statut, categorie, localisation, dateCreation, id, refuseReason } = ticket;

  const shortDesc = description.length > 100
    ? description.slice(0, 100).trimEnd() + "…"
    : description;

  const handleResolveConfirm = (solution) => { onResolve(ticket.id, solution); setShowResolve(false); };
  const handleRefuseConfirm  = (reason)   => { onRefuse(ticket.id, reason);   setShowRefuse(false);  };

  const badge     = BADGE_MAP[statut];
  const bannerBg  = BANNER_BG[categorie] || "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)";
  const isRefused = statut === "refused";

  return (
    <>
      <div className={`ta-card${isRefused ? " refused" : ""}`}>

        {/* ── Bandeau ── */}
        <div className="ta-card-banner">
          <div className="ta-card-banner-bg" style={{ background: bannerBg }} />
          <div className="ta-card-banner-overlay" />
          {badge && (
            <span className={`ta-active-badge ${badge.cls}`}>{badge.label}</span>
          )}
          <div className="ta-card-banner-content">
            <span className="ta-card-ticket-id">#{id?.toUpperCase()}</span>
            <Badge status={priorite} />
          </div>
        </div>

        {/* ── Stripe priorité ── */}
        <div className={`ta-card-stripe ${STRIPE_CLASS[priorite] || "stripe-low"}`} />

        {/* ── Corps ── */}
        <div className="ta-card-body">
          <div className="ta-card-title">{titre}</div>
          <div className="ta-card-meta">
            <span className="ta-card-cat">{categorie}</span>
            <span className="ta-card-loc"><IcoPin /> {localisation}</span>
          </div>
          <p className="ta-card-desc">{shortDesc}</p>
          <div className="ta-card-date">Créé le {formatDate(dateCreation)}</div>
        </div>

        {/* ── Motif refus ── */}
        {isRefused && refuseReason && (
          <div className="ta-refused-note">
            <span className="ta-refused-note-ico"><IcoAlert /></span>
            <span><strong>Motif :</strong> {refuseReason}</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="ta-card-footer">
          {/* Statut */}
          <div className="ta-card-status-row">
            <span className="ta-card-status-dot" style={{ background: STATUS_DOT[statut] || "#9CA3AF" }} />
            <strong style={{ color: "#0F172A" }}>
              {BADGE_MAP[statut]?.label || statut}
            </strong>
          </div>

          {/* Actions */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>

            {/* ASSIGNED — Accepter + Refuser */}
            {statut === "assigned" && (<>
              <button className="ta-btn ta-btn-refuse" onClick={() => setShowRefuse(true)}>
                <IcoX /> Refuser
              </button>
              <button className="ta-btn ta-btn-accept" onClick={() => onAccept(ticket.id)}>
                <IcoPlay /> Accepter
              </button>
            </>)}

            {/* IN PROGRESS — En attente + Résoudre */}
            {statut === "in_progress" && (<>
              <button className="ta-btn ta-btn-hold" onClick={() => onHold(ticket.id)}>
                <IcoPause /> En attente
              </button>
              <button className="ta-btn ta-btn-resolve" onClick={() => setShowResolve(true)}>
                <IcoCheck /> Résoudre
              </button>
            </>)}

            {/* PENDING — Reprendre */}
            {statut === "pending" && (
              <button className="ta-btn ta-btn-accept" onClick={() => onAccept(ticket.id)}>
                <IcoPlay /> Reprendre
              </button>
            )}

            {/* RESOLVED / CLOSED */}
            {(statut === "resolved" || statut === "closed") && (
              <span className="ta-btn ta-btn-disabled">
                <IcoCheck /> {statut === "resolved" ? "Résolu" : "Clôturé"}
              </span>
            )}

            {/* REFUSED — libéré, en attente manager */}
            {isRefused && (
              <span className="ta-btn ta-btn-disabled">
                En attente de réassignation
              </span>
            )}
          </div>
        </div>
      </div>

      <ResolveModal
        ticket={showResolve ? ticket : null}
        onClose={() => setShowResolve(false)}
        onConfirm={handleResolveConfirm}
      />
      <RefuseModal
        ticket={showRefuse ? ticket : null}
        onClose={() => setShowRefuse(false)}
        onConfirm={handleRefuseConfirm}
      />
    </>
  );
}