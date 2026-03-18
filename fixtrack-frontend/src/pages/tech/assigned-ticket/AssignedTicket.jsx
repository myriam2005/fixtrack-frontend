// src/pages/tech/assigned-ticket/AssignedTicket.jsx
// ✅ VERSION BACKEND — liste complète des tickets assignés au technicien
import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./AssignedTicket.module.css";
import Badge from "../../../components/common/badge/Badge";
import { useAuth } from "../../../context/AuthContext";
import { ticketService } from "../../../services/api";
import { useNotifications } from "../../../context/NotificationContext";
import DetailTicket from "../../ticketDetails";

const STATUT_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "assigned",    label: "Assignés" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
  { key: "closed",      label: "Clôturés" },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatId = (id) => `FT-${(id || "").toString().slice(-6).toUpperCase()}`;

// ─── Icônes ───────────────────────────────────────────────────────────────────
const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconPin     = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconClock   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconAlert   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlay    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconArrow   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconNote    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

const PRIORITY_BORDER = { critical: "#EF4444", high: "#F97316", medium: "#3B82F6", low: "#D1D5DB" };
const STATUS_ACTIONS  = {
  assigned:    { label: "Démarrer",  icon: <IconPlay />,  nextStatus: "in_progress", color: "#F59E0B" },
  in_progress: { label: "Résoudre", icon: <IconCheck />, nextStatus: "resolved",    color: "#22C55E" },
};

// ─── Quick action modal ───────────────────────────────────────────────────────
function QuickActionModal({ ticket, onClose, onConfirm }) {
  const [solution, setSolution] = useState("");
  const action = STATUS_ACTIONS[ticket?.statut];
  if (!ticket || !action) return null;
  const isResolve = ticket.statut === "in_progress";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ background: "#1E3A5F", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: "#93C5FD", fontWeight: 500, marginBottom: 3 }}>{ticket.categorie}</div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {isResolve ? "Marquer comme résolu" : "Démarrer l'intervention"}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 18, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>{ticket.titre}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              <IconPin /> {ticket.localisation}
            </div>
          </div>
          {isResolve && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>
                Solution appliquée *
              </label>
              <textarea value={solution} onChange={e => setSolution(e.target.value)} rows={3}
                placeholder="Décrivez la solution apportée pour résoudre ce ticket…"
                style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 9, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", color: "#1E293B", boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, height: 44, border: "1.5px solid #E2E8F0", borderRadius: 9, background: "#fff", fontSize: 13.5, fontWeight: 600, color: "#64748B", cursor: "pointer", fontFamily: "inherit" }}>
              Annuler
            </button>
            <button onClick={() => onConfirm(action.nextStatus, solution)} disabled={isResolve && !solution.trim()}
              style={{ flex: 1, height: 44, border: "none", borderRadius: 9, background: isResolve && !solution.trim() ? "#D1D5DB" : action.color, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: isResolve && !solution.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {action.icon} {action.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ligne ticket ─────────────────────────────────────────────────────────────
function TicketRow({ ticket, onViewDetail, onQuickAction, isLast }) {
  const [hovered, setHovered] = useState(false);
  const isCriticalLate = ticket.priorite === "critical" &&
    !["resolved","closed"].includes(ticket.statut) &&
    (Date.now() - new Date(ticket.createdAt).getTime()) > 86400000;

  const action = STATUS_ACTIONS[ticket.statut];

  return (
    <>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
        display: "flex", alignItems: "center", gap: 14, padding: "13px 18px 13px 16px",
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        background: hovered ? (isCriticalLate ? "#FFF0F0" : "#F8FAFF") : (isCriticalLate ? "#FFF8F8" : "transparent"),
        transition: "background .15s, padding-left .15s",
        paddingLeft: hovered ? 20 : 16,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB" }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>
              {formatId(ticket._id || ticket.id)}
            </span>
            {isCriticalLate && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 20, padding: "1px 7px" }}>
                +24h retard
              </span>
            )}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
            {ticket.titre}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#9CA3AF" }}>
              <IconPin />
              <span style={{ fontSize: 11, color: "#9CA3AF", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.localisation}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#9CA3AF" }}>
              <IconClock />
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
          <Badge status={ticket.priorite} />
          <Badge status={ticket.statut}   />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity .15s" }}>
          {action && (
            <button onClick={() => onQuickAction(ticket)} style={{
              height: 32, padding: "0 12px", borderRadius: 8, border: "none",
              background: action.color, color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
            }}>
              {action.icon} {action.label}
            </button>
          )}
          <button onClick={() => onViewDetail(ticket._id || ticket.id)} style={{
            height: 32, padding: "0 10px", borderRadius: 8, border: "1px solid #E5E7EB",
            background: "#fff", color: "#2563EB", fontSize: 12, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
          }}>
            Détails <IconArrow />
          </button>
        </div>
      </div>
      {!isLast && <div style={{ height: 1, background: "#F3F4F6", margin: "0 18px" }} />}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: "flex", gap: 14, padding: "13px 18px", borderLeft: "3px solid #E5E7EB", borderRadius: "0 10px 10px 0" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F1F5F9", flexShrink: 0, marginTop: 6 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 12, width: 80,  background: "#F1F5F9", borderRadius: 4 }} />
        <div style={{ height: 14, width: "60%", background: "#F1F5F9", borderRadius: 4 }} />
        <div style={{ height: 11, width: "40%", background: "#F1F5F9", borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AssignedTicket() {
  const { user: authUser }              = useAuth();
  const { triggerEvent }                = useNotifications();

  const [tickets,     setTickets]       = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [error,       setError]         = useState("");
  const [activeTab,   setActiveTab]     = useState("all");
  const [search,      setSearch]        = useState("");
  const [sortBy,      setSortBy]        = useState("date");   // date | priority
  const [selectedId,  setSelectedId]    = useState(null);
  const [actionTicket, setActionTicket] = useState(null);
  const [toast,       setToast]         = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ticketService.getAll();
      setTickets((data || []).map(t => ({ ...t, id: t._id || t.id })));
    } catch {
      setError("Impossible de charger les tickets. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:         tickets.length,
    assigned:    tickets.filter(t => t.statut === "assigned").length,
    in_progress: tickets.filter(t => t.statut === "in_progress").length,
    resolved:    tickets.filter(t => t.statut === "resolved").length,
    closed:      tickets.filter(t => t.statut === "closed").length,
  }), [tickets]);

  // ── Filtrage + tri ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...tickets];
    if (activeTab !== "all") result = result.filter(t => t.statut === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.titre?.toLowerCase().includes(q) ||
        t.localisation?.toLowerCase().includes(q) ||
        t.categorie?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "priority") {
      result.sort((a, b) => (PRIORITY_ORDER[a.priorite] ?? 9) - (PRIORITY_ORDER[b.priorite] ?? 9));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [tickets, activeTab, search, sortBy]);

  // ── Quick action : changer statut ─────────────────────────────────────────
  const handleConfirmAction = async (nextStatus, solution) => {
    if (!actionTicket) return;
    try {
      if (nextStatus === "resolved") {
        await ticketService.resolve(actionTicket._id || actionTicket.id, solution);
      } else {
        await ticketService.updateStatus(actionTicket._id || actionTicket.id, nextStatus);
      }
      setTickets(prev => prev.map(t =>
        (t._id || t.id) === (actionTicket._id || actionTicket.id)
          ? { ...t, statut: nextStatus }
          : t
      ));
      triggerEvent("ticket_in_progress", { ...actionTicket, statut: nextStatus });
      showToast(`Ticket "${actionTicket.titre}" → ${nextStatus === "in_progress" ? "en cours" : "résolu"}`);
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setActionTicket(null);
    }
  };

  const criticalLate = tickets.filter(t =>
    t.priorite === "critical" &&
    !["resolved","closed"].includes(t.statut) &&
    (Date.now() - new Date(t.createdAt).getTime()) > 86400000
  );

  const firstName = (authUser?.nom || authUser?.name || "").split(" ")[0];

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, background: toast.type === "error" ? "#DC2626" : "#111827", color: "#fff", borderRadius: 12, padding: "12px 18px", fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{toast.type === "error" ? "⚠" : "✅"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 28, height: 2, background: "#2563EB", borderRadius: 1 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: ".12em" }}>Mes tickets</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: "#111827", letterSpacing: "-.02em", lineHeight: 1.15, margin: "0 0 6px" }}>
          Tickets assignés
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          {loading ? "Chargement…" : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""} dans votre file de travail`}
        </p>
      </div>

      {/* Alerte critiques > 24h */}
      {criticalLate.length > 0 && (
        <div style={{ borderRadius: 12, background: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <IconAlert />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", marginBottom: 4 }}>
              {criticalLate.length} ticket{criticalLate.length > 1 ? "s" : ""} critique{criticalLate.length > 1 ? "s" : ""} non traité{criticalLate.length > 1 ? "s" : ""} depuis plus de 24h
            </div>
            {criticalLate.map(t => (
              <div key={t._id || t.id} style={{ fontSize: 12, color: "#7F1D1D", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
                <strong>{formatId(t._id || t.id)}</strong> — {t.titre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#DC2626" }}>
          ⚠ {error}
        </div>
      )}

      {/* Barre de recherche + tri */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
            <IconSearch />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un ticket…"
            style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #E5E7EB", paddingLeft: 34, paddingRight: 12, fontSize: 13, color: "#111827", background: "#FAFAFA", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ height: 42, borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "0 14px", fontSize: 13, color: "#374151", background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="date">Trier par date</option>
          <option value="priority">Trier par priorité</option>
        </select>
      </div>

      {/* Tableau principal */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        {/* Tabs */}
        <div style={{ padding: "14px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {STATUT_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const count    = counts[tab.key] ?? 0;
              return (
                <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 13px",
                  cursor: "pointer", borderRadius: "8px 8px 0 0", flexShrink: 0,
                  borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                  background: isActive ? "#F0F7FF" : "transparent",
                }}>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280" }}>{tab.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: isActive ? "#2563EB" : "#E5E7EB", color: isActive ? "#fff" : "#6B7280", borderRadius: 20, padding: "0 6px", lineHeight: "18px" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "8px 6px 12px" }}>
          {loading ? (
            <>
              {[1,2,3,4,5].map(i => (
                <div key={i}>
                  <SkeletonRow />
                  {i < 5 && <div style={{ height: 1, background: "#F3F4F6", margin: "0 18px" }} />}
                </div>
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Aucun ticket dans cette catégorie</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                {search ? "Essayez d'ajuster votre recherche." : "Les tickets qui vous sont assignés apparaîtront ici."}
              </div>
            </div>
          ) : (
            filtered.map((ticket, index) => (
              <TicketRow key={ticket._id || ticket.id} ticket={ticket}
                isLast={index === filtered.length - 1}
                onViewDetail={id => setSelectedId(id)}
                onQuickAction={t => setActionTicket(t)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              <strong style={{ color: "#2563EB" }}>{filtered.length}</strong> ticket{filtered.length !== 1 ? "s" : ""} affichés sur <strong style={{ color: "#6B7280" }}>{tickets.length}</strong>
            </span>
            {search && (
              <button onClick={() => setSearch("")} style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedId  && <DetailTicket ticketId={selectedId}    onClose={() => setSelectedId(null)}  />}
      {actionTicket && <QuickActionModal ticket={actionTicket} onClose={() => setActionTicket(null)} onConfirm={handleConfirmAction} />}
    </div>
  );
}