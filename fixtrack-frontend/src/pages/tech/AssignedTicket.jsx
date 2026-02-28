// src/pages/tech/AssignedTicket.jsx
import { useState } from "react";
import { tickets } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { CSS, FILTERS, PRIORITY_FILTERS } from "./ticketsUtils";
import TicketCard from "./TicketCard";

const IcoInbox  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoFilter = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;

export default function AssignedTicket() {
  const { user } = useAuth();
  const [tick,     setTick]     = useState(0);
  const [filter,   setFilter]   = useState("all");
  const [priority, setPriority] = useState("all");
  const [search,   setSearch]   = useState("");

  const rerender = () => setTick(t => t + 1);
  const userId   = user?.id ?? null;

  // All tickets assigned to this technician (including refused ones)
  const myTickets = userId ? tickets.filter(t => t.technicienId === userId) : [];

  const filtered = myTickets.filter(t => {
    const matchStatut   = filter   === "all" || t.statut   === filter;
    const matchPriority = priority === "all" || t.priorite === priority;
    const q = search.trim().toLowerCase();
    const matchSearch   = !q
      || t.titre.toLowerCase().includes(q)
      || t.localisation.toLowerCase().includes(q)
      || t.id.toLowerCase().includes(q);
    return matchStatut && matchPriority && matchSearch;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
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
    if (t) {
      t.statut = "resolved";
      t.notes  = [...(t.notes || []), solution];
      rerender();
    }
  };

  // Refuse: mark ticket as refused + store reason + free it for manager reassignment
  const handleRefuse = (id, reason) => {
    const t = tickets.find(t => t.id === id);
    if (t) {
      t.statut       = "refused";
      t.refuseReason = reason;
      // technicienId stays set so the card stays visible for the tech,
      // but the manager's view filters on statut === "refused" to reassign
      rerender();
    }
  };

  if (!userId) {
    return (
      <div className="ta">
        <style>{CSS}</style>
        <div className="ta-empty">
          <div className="ta-empty-icon"><IcoInbox /></div>
          <p style={{ margin: 0, fontWeight: 600, color: "#DC2626" }}>Session introuvable</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Veuillez vous reconnecter.</p>
        </div>
      </div>
    );
  }

  const refusedCount = myTickets.filter(t => t.statut === "refused").length;

  return (
    <div className="ta">
      <style>{CSS}</style>

      {/* ── En-tête ── */}
      <div className="ta-header">
        <div className="ta-eyebrow">Espace technicien</div>
        <h1 className="ta-title">Mes tickets assignés</h1>
        <p className="ta-subtitle">
          {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} au total
          {filtered.length !== myTickets.length && (
            <span style={{ color: "#2563EB", marginLeft: 6 }}>
              — {filtered.length} affiché{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          {refusedCount > 0 && (
            <span style={{ color: "#DC2626", marginLeft: 8, fontWeight: 600 }}>
              · {refusedCount} refusé{refusedCount > 1 ? "s" : ""} — en attente de réassignation
            </span>
          )}
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="ta-toolbar">
        <div className="ta-search-wrap">
          <span className="ta-search-ico"><IcoSearch /></span>
          <input
            className="ta-search"
            placeholder="Rechercher par ID, titre ou localisation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ta-select-wrap">
          <span className="ta-select-label">STATUT :</span>
          <select className="ta-select" value={filter} onChange={e => setFilter(e.target.value)}>
            {FILTERS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="ta-select-wrap">
          <span className="ta-select-label">PRIORITÉ :</span>
          <select className="ta-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITY_FILTERS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        <button
          className="ta-filter-icon-btn"
          title="Réinitialiser les filtres"
          onClick={() => { setFilter("all"); setPriority("all"); setSearch(""); }}
        >
          <IcoFilter />
        </button>
      </div>

      {/* ── Résultats ── */}
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
              onRefuse={handleRefuse}
            />
          ))}
        </div>
      )}
    </div>
  );
}