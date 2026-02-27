// src/pages/technician/TicketsAssignes/TicketsAssignes.jsx
import { useState } from "react";
import { tickets }  from "../../data/mockData";
import { useAuth }  from "../../context/AuthContext";
import { CSS, FILTERS } from "./ticketsUtils";
import TicketCard from "./TicketCard";

const IcoInbox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

export default function AssignedTicket() {
  const { user } = useAuth();
  const [tick,   setTick]   = useState(0);
  const [filter, setFilter] = useState("all");

  const rerender = () => setTick(t => t + 1);

  const myTickets = tickets.filter(t => t.technicienId === user?.id);
  const filtered  = filter === "all" ? myTickets : myTickets.filter(t => t.statut === filter);
  const countFor  = (key) => key === "all" ? myTickets.length : myTickets.filter(t => t.statut === key).length;

  const handleAccept = (id) => {
    const t = tickets.find(t => t.id === id);
    if (t) { t.statut = "in_progress"; rerender(); }
  };

  const handleHold = (id) => {
    const t = tickets.find(t => t.id === id);
    if (t) { t.statut = "pending"; rerender(); }
  };

  const handleResolve = (id, solution) => {
    const t = tickets.find(t => t.id === id);
    if (t) { t.statut = "resolved"; t.notes = [...(t.notes || []), solution]; rerender(); }
  };

  return (
    <div className="ta">
      <style>{CSS}</style>

      <div className="ta-header">
        <div className="ta-eyebrow">Espace technicien</div>
        <h1 className="ta-title">Mes tickets assignés</h1>
        <p className="ta-subtitle">
          {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      <div className="ta-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`ta-filter-btn${filter === f.key ? " on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="ta-filter-count">{countFor(f.key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ta-empty">
          <div className="ta-empty-icon"><IcoInbox /></div>
          <p style={{ margin: 0, fontWeight: 600, color: "#64748B" }}>Aucun ticket dans cette catégorie</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Les tickets vous seront assignés par le manager.</p>
        </div>
      ) : (
        <div className="ta-grid">
          {filtered.map(ticket => (
            <TicketCard
              key={ticket.id + tick}
              ticket={ticket}
              onAccept={handleAccept}
              onHold={handleHold}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}