// src/pages/technician/TicketsAssignes/TicketCard.jsx
import { useState } from "react";
import Badge  from "../../components/common/Badge";
import Modal  from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { STRIPE_CLASS, formatDate } from "./ticketsUtils";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoPause = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

// ── Resolve modal (local to the card — no reason to lift it higher) ───────────
function ResolveModal({ ticket, onClose, onConfirm }) {
  const [solution, setSolution] = useState("");
  const [error,    setError]    = useState("");

  const handleConfirm = () => {
    if (!solution.trim()) { setError("La solution est obligatoire."); return; }
    onConfirm(solution.trim());
    setSolution(""); setError("");
  };

  const handleClose = () => {
    setSolution(""); setError(""); onClose();
  };

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

// ── TicketCard ────────────────────────────────────────────────────────────────
export default function TicketCard({ ticket, onAccept, onHold, onResolve }) {
  const [showModal, setShowModal] = useState(false);
  const { titre, description, priorite, statut, categorie, localisation, dateCreation } = ticket;

  const shortDesc = description.length > 100
    ? description.slice(0, 100).trimEnd() + "…"
    : description;

  const handleResolveConfirm = (solution) => {
    onResolve(ticket.id, solution);
    setShowModal(false);
  };

  return (
    <>
      <div className="ta-card">
        <div className={`ta-card-stripe ${STRIPE_CLASS[priorite] || "stripe-low"}`} />

        <div className="ta-card-body">
          <div className="ta-card-top">
            <div className="ta-card-title">{titre}</div>
            <Badge status={priorite} />
          </div>
          <div className="ta-card-meta">
            <span className="ta-card-cat">{categorie}</span>
            <span className="ta-card-loc"><IcoPin /> {localisation}</span>
          </div>
          <p className="ta-card-desc">{shortDesc}</p>
          <div className="ta-card-date">Créé le {formatDate(dateCreation)}</div>
        </div>

        <div className="ta-card-footer">
          <Badge status={statut} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>

            {statut === "assigned" && (
              <button className="ta-btn ta-btn-accept" onClick={() => onAccept(ticket.id)}>
                <IcoPlay /> Accepter
              </button>
            )}

            {statut === "in_progress" && (<>
              <button className="ta-btn ta-btn-hold" onClick={() => onHold(ticket.id)}>
                <IcoPause /> Mettre en attente
              </button>
              <button className="ta-btn ta-btn-resolve" onClick={() => setShowModal(true)}>
                <IcoCheck /> Marquer résolu
              </button>
            </>)}

            {statut === "pending" && (
              <button className="ta-btn ta-btn-accept" onClick={() => onAccept(ticket.id)}>
                <IcoPlay /> Reprendre
              </button>
            )}

            {(statut === "resolved" || statut === "closed") && (
              <span className="ta-btn ta-btn-disabled">
                <IcoCheck /> {statut === "resolved" ? "Résolu" : "Clôturé"}
              </span>
            )}

          </div>
        </div>
      </div>

      <ResolveModal
        ticket={showModal ? ticket : null}
        onClose={() => setShowModal(false)}
        onConfirm={handleResolveConfirm}
      />
    </>
  );
}