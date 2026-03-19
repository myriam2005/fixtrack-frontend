// src/pages/tech/AssignedTicket.jsx
// ✅ VERSION BACKEND — même architecture cards/grid, données réelles via API
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ticketService } from "../../../services/api";
import { useNotifications } from "../../../context/NotificationContext";
import { CSS, FILTERS, PRIORITY_FILTERS } from "./ticketsUtils";
import TicketCard from "./TicketCard";

const IcoInbox  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoFilter = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;

export default function AssignedTicket() {
  const { user }         = useAuth();
  const { triggerEvent } = useNotifications();

  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all");
  const [priority, setPriority] = useState("all");
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ✅ Fetch depuis le backend
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ticketService.getAll();
      // Le backend filtre déjà par technicienId pour le rôle "technician"
      setTickets((data || []).map(t => ({
        ...t,
        id: t._id || t.id,                         // compatibilité avec TicketCard
        technicienId: t.technicienId?._id || t.technicienId,
        auteurId:     t.auteurId?._id     || t.auteurId,
      })));
    } catch {
      setError("Impossible de charger les tickets. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // ── Filtrage local ────────────────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const matchStatut   = filter   === "all" || t.statut   === filter;
    const matchPriority = priority === "all" || t.priorite === priority;
    const q = search.trim().toLowerCase();
    const matchSearch   = !q
      || (t.titre       || "").toLowerCase().includes(q)
      || (t.localisation|| "").toLowerCase().includes(q)
      || (t.id          || "").toLowerCase().includes(q);
    return matchStatut && matchPriority && matchSearch;
  });

  // ── Handlers — wrappent l'API puis mettent à jour le state local ──────────

  // Démarrer l'intervention
  const handleAccept = async (id) => {
    try {
      await ticketService.updateStatus(id, "in_progress");
      setTickets(prev => prev.map(t => t.id === id ? { ...t, statut: "in_progress" } : t));
      triggerEvent("ticket_in_progress", { id });
      showToast("Intervention démarrée ✓");
    } catch {
      showToast("Erreur lors de la mise à jour", "warn");
    }
  };

  // Mettre en attente (pending)
  const handleHold = async (id) => {
    try {
      await ticketService.updateStatus(id, "assigned");
      setTickets(prev => prev.map(t => t.id === id ? { ...t, statut: "assigned" } : t));
      showToast("Ticket mis en attente");
    } catch {
      showToast("Erreur lors de la mise à jour", "warn");
    }
  };

  // Résoudre avec solution
  const handleResolve = async (id, solution) => {
    try {
      await ticketService.resolve(id, solution);
      setTickets(prev => prev.map(t =>
        t.id === id ? { ...t, statut: "resolved", notes: [...(t.notes || []), solution] } : t
      ));
      triggerEvent("ticket_resolved", { id });
      showToast("Ticket marqué comme résolu ✓");
    } catch {
      showToast("Erreur lors de la résolution", "warn");
    }
  };

  // Refuser — ajoute une note avec la raison + repasse à "open" pour reassignation
  const handleRefuse = async (id, reason) => {
    try {
      await ticketService.addNote(id, { texte: `⛔ REFUS : ${reason}` });
      await ticketService.updateStatus(id, "open");
      setTickets(prev => prev.map(t =>
        t.id === id ? { ...t, statut: "refused", refuseReason: reason } : t
      ));
      showToast("Ticket refusé — le manager sera notifié", "warn");
    } catch {
      showToast("Erreur lors du refus", "warn");
    }
  };

  if (!user) {
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

  const refusedCount = tickets.filter(t => t.statut === "refused").length;

  return (
    <div className="ta">
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 2000,
          background: toast.type === "warn" ? "#D97706" : "#111827",
          color: "#fff", borderRadius: 12, padding: "12px 18px",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          {toast.type === "warn" ? "⚠" : "✅"} {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div className="ta-header">
        <div className="ta-eyebrow">Espace technicien</div>
        <h1 className="ta-title">Mes tickets assignés</h1>
        <p className="ta-subtitle">
          {loading ? "Chargement…" : (
            <>
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} au total
              {filtered.length !== tickets.length && (
                <span style={{ color: "#2563EB", marginLeft: 6 }}>
                  — {filtered.length} affiché{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
              {refusedCount > 0 && (
                <span style={{ color: "#DC2626", marginLeft: 8, fontWeight: 600 }}>
                  · {refusedCount} refusé{refusedCount > 1 ? "s" : ""} — en attente de réassignation
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Erreur API */}
      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626" }}>
          ⚠ {error}
          <button onClick={fetchTickets} style={{ marginLeft: 12, background: "none", border: "none", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            Réessayer
          </button>
        </div>
      )}

      {/* Toolbar */}
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
            {FILTERS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>

        <div className="ta-select-wrap">
          <span className="ta-select-label">PRIORITÉ :</span>
          <select className="ta-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITY_FILTERS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="ta-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
              {[80, 100, 60].map((w, j) => (
                <div key={j} style={{ height: 14, width: `${w}%`, borderRadius: 6, background: "#F1F5F9", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        </div>
      )}

      {/* Résultats */}
      {!loading && filtered.length === 0 && (
        <div className="ta-empty">
          <div className="ta-empty-icon"><IcoInbox /></div>
          <p style={{ margin: 0, fontWeight: 600, color: "#64748B" }}>Aucun ticket dans cette catégorie</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>
            {tickets.length === 0
              ? "Les tickets vous seront assignés par le manager."
              : "Essayez de modifier vos filtres."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="ta-grid">
          {filtered.map(ticket => (
            <TicketCard
              key={ticket.id}
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