// src/pages/manager/AssignerTicket.jsx
// ✅ Ajout : badge "Refusé" dans la liste + bandeau motif + réassignation directe

import { useState, useEffect } from "react";
import { Box, Divider }        from "@mui/material";
import Badge                   from "../../components/common/badge/Badge";
import Button                  from "../../components/common/Button";
import { ticketService, userService } from "../../services/api";
import styles                  from "../employee/my-ticket/MyTickets.module.css";

const PRIORITY_LEFT_COLOR = {
  critical: "#EF4444", high: "#F59E0B", medium: "#3B82F6", low: "#9CA3AF",
};
const AVATAR_COLORS = ["#16a34a","#0d9488","#dc2626","#d97706","#7c3aed","#2563eb","#0891b2"];

const chargeOf = (techId, tickets) =>
  tickets.filter(t => (t.technicienId?._id || t.technicienId) === techId && ["assigned","in_progress"].includes(t.statut)).length;

if (typeof document !== "undefined" && !document.getElementById("at-modal-styles")) {
  const s = document.createElement("style");
  s.id = "at-modal-styles";
  s.textContent = `
    @keyframes at-fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes at-slideUp { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes at-toast   { from{opacity:0;transform:translateX(-50%) translateY(14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes at-rowIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
    .at-tc { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:14px; cursor:pointer; transition:all .18s cubic-bezier(.22,1,.36,1); position:relative; }
    .at-tc:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(37,99,235,0.10) !important; }
    .at-row { transition: background 0.15s, padding-left 0.15s; }
    .at-row:hover { background: #F8FAFF !important; }
    .at-row.refused-row { background: #FFF5F5 !important; border-left-color: #EF4444 !important; }
    .at-row.refused-row:hover { background: #FFF0F0 !important; }
    .at-assign-btn { transition: background 0.15s, transform 0.12s, box-shadow 0.12s !important; }
    .at-assign-btn:hover { transform: scale(1.04) !important; box-shadow: 0 4px 14px rgba(37,99,235,0.25) !important; }
    .at-assign-btn:active { transform: scale(0.97) !important; }
    .at-tab { transition: color 0.15s, border-color 0.15s !important; }
    .at-tab:hover { color: #2563EB !important; }
    .refused-reason-inline { font-size:11px; color:#991B1B; background:#FEF2F2; border:1px solid #FECACA; border-radius:6px; padding:3px 8px; display:inline-flex; align-items:center; gap:4px; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  `;
  document.head.appendChild(s);
}

// ── Badge statut pour le tableau ─────────────────────────────────────────────
function StatusBadge({ statut }) {
  const map = {
    open:        { label: "Ouvert",      bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    assigned:    { label: "Assigné",     bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    in_progress: { label: "En cours",    bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    resolved:    { label: "Résolu",      bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
    closed:      { label: "Clôturé",     bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
    refused:     { label: "Refusé",  bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };
  const cfg = map[statut] || map.open;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

function TicketRow({ ticket, tech, isLast, onAssign, index }) {
  const leftColor  = PRIORITY_LEFT_COLOR[ticket.priorite] || "#E2E8F0";
  const techName   = tech?.nom || null;
  const isRefused  = ticket.statut === "refused";

  return (
    <>
      <Box className={`at-row${isRefused ? " refused-row" : ""}`} sx={{
        display: "flex", alignItems: { xs: "flex-start", md: "center" },
        gap: { xs: "10px", md: "14px" }, padding: { xs: "14px 12px 14px 10px", md: "13px 18px 13px 16px" },
        borderLeft: `3px solid ${isRefused ? "#EF4444" : leftColor}`,
        borderRadius: "0 10px 10px 0",
        animation: `at-rowIn 0.3s ease ${index * 0.04}s both`, flexWrap: { xs: "wrap", md: "nowrap" },
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: isRefused ? "#EF4444" : leftColor, boxShadow: `0 0 0 3px ${isRefused ? "#EF444422" : leftColor + "22"}`, display: { xs: "none", md: "block" } }} />
        <Box sx={{ width: { xs: "auto", md: 44 }, flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>
            {(ticket._id || ticket.id || "").toString().slice(-6).toUpperCase()}
          </span>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: isRefused ? "#991B1B" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
            {ticket.titre}
          </div>
          <div style={{ fontSize: 11.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            📍 {ticket.localisation}
            {/* ✅ Motif du refus affiché inline */}
            {isRefused && ticket.refusedReason && (
              <span className="refused-reason-inline" title={ticket.refusedReason}>
                {ticket.refusedReason}
              </span>
            )}
          </div>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: "6px", mt: "6px", flexWrap: "wrap" }}>
            <Badge status={ticket.priorite} />
            <StatusBadge statut={ticket.statut} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
          </Box>
        </Box>
        <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
          <span className={styles.catBadge}>{ticket.categorie}</span>
        </Box>
        <Box sx={{ width: 100, flexShrink: 0, display: { xs: "none", md: "block" } }}>
          <Badge status={ticket.priorite} />
        </Box>
        {/* ✅ Colonne statut */}
        <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", md: "block" } }}>
          <StatusBadge statut={ticket.statut} />
        </Box>
        <Box sx={{ width: 90, flexShrink: 0, display: { xs: "none", md: "block" } }}>
          <span className={styles.date}>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
        </Box>
        <Box sx={{ width: { xs: "auto", md: 150 }, flexShrink: 0 }}>
          {techName ? (
            <div className={styles.techWrap}>
              <div className={styles.avatar} style={{ background: isRefused ? "#EF4444" : AVATAR_COLORS[0] }}>{techName[0].toUpperCase()}</div>
              <span className={styles.techName} style={{ color: isRefused ? "#991B1B" : undefined }}>{techName}</span>
            </div>
          ) : <span className={styles.unassigned}>Non assigné</span>}
        </Box>
        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: 130 }, display: "flex", justifyContent: { xs: "flex-end", md: "center" } }}>
          <button className="at-assign-btn" onClick={() => onAssign(ticket)} style={{
            padding: "7px 18px", borderRadius: "999px", border: "none",
            background: isRefused
              ? "linear-gradient(135deg, #DC2626, #B91C1C)"
              : "linear-gradient(135deg, #2563EB, #1D4ED8)",
            color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
            whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: isRefused ? "0 2px 8px rgba(220,38,38,0.3)" : "0 2px 8px rgba(37,99,235,0.2)",
          }}>
            {isRefused ? "Réassigner" : ticket.technicienId ? "Réassigner" : "Assigner"}
          </button>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: { xs: "10px", md: "18px" } }} />}
    </>
  );
}

export default function AssignTicket() {
  const [tickets,      setTickets]   = useState([]);
  const [techniciens,  setTechs]     = useState([]);
  const [loading,      setLoading]   = useState(true);
  const [search,       setSearch]    = useState("");
  const [activeTab,    setActiveTab] = useState("all");
  const [modal,        setModal]     = useState(null);
  const [selectedTech, setSel]       = useState(null);
  const [toast,        setToast]     = useState(null);
  const [assigning,    setAssigning] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ticketsData, techs] = await Promise.all([
          ticketService.getAll(),
          userService.getTechnicians(),
        ]);
        setTickets(ticketsData || []);
        setTechs(techs || []);
      } catch {
        // erreur silencieuse
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ✅ Écoute le paramètre URL ?ticketId=xxx pour ouvrir le modal directement
  // (utilisé par le bouton quick-assign dans les notifications)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid    = params.get("ticketId");
    if (tid && tickets.length > 0) {
      const ticket = tickets.find(t => (t._id || t.id) === tid);
      if (ticket) {
        setModal(ticket);
        setSel(ticket.technicienId?._id || ticket.technicienId || null);
        // Nettoie l'URL sans recharger
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [tickets]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const confirmer = async () => {
    if (!selectedTech || !modal) return;
    const tech = techniciens.find(t => (t._id || t.id) === selectedTech);
    setAssigning(true);
    try {
      const data = await ticketService.assign(modal._id || modal.id, selectedTech);
      setTickets(prev => prev.map(t => (t._id || t.id) === (modal._id || modal.id) ? data : t));
      setModal(null); setSel(null);
      showToast(`Ticket assigné à ${tech?.nom}`);
    } catch {
      showToast("Erreur lors de l'assignation.");
    } finally {
      setAssigning(false);
    }
  };

  // ✅ Onglets incluant "refused"
  const TABS = [
    { key: "all",         label: "Tous"      },
    { key: "open",        label: "Ouverts"   },
    { key: "assigned",    label: "Assignés"  },
    { key: "in_progress", label: "En cours"  },
    { key: "refused",     label: "Refusés" },
    { key: "resolved",    label: "Résolus"   },
    { key: "closed",      label: "Clôturés"  },
  ];

  const tabCounts = {};
  TABS.forEach(t => {
    tabCounts[t.key] = t.key === "all" ? tickets.length : tickets.filter(tk => tk.statut === t.key).length;
  });

  const visible = tickets.filter(t => {
    const inTab    = activeTab === "all" || t.statut === activeTab;
    const inSearch = !search || t.titre?.toLowerCase().includes(search.toLowerCase()) || t.localisation?.toLowerCase().includes(search.toLowerCase());
    return inTab && inSearch;
  });

  const techOf = (ticket) => {
    const techId = ticket.technicienId?._id || ticket.technicienId;
    return techId ? techniciens.find(u => (u._id || u.id) === techId) : null;
  };

  const refusedCount = tickets.filter(t => t.statut === "refused").length;

  return (
    <div className={styles.root} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageEyebrow}>Manager · Assignation</span>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 className={styles.pageTitle}>Assignation des tickets</h1>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, background: "#F1F5F9", color: "#64748B", fontSize: 13, fontWeight: 500 }}>
              {loading ? "Chargement…" : `${tickets.length} ticket(s)`}
            </span>
            {/* ✅ Badge d'alerte si des tickets sont refusés */}
            {!loading && refusedCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 20, background: "#FEF2F2", color: "#DC2626", fontSize: 13, fontWeight: 700, border: "1px solid #FECACA" }}>
                 {refusedCount} refusé{refusedCount > 1 ? "s" : ""} — à réassigner
              </span>
            )}
          </Box>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: "12px", padding: { xs: "16px 16px 12px", md: "20px 24px 16px" } }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Liste des tickets</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94A3B8" }}>{visible.length} ticket{visible.length !== 1 ? "s" : ""} affichés</p>
          </div>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "8px 14px", width: { xs: "100%", sm: "290px" }, "&:focus-within": { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" } }}>
            <span style={{ fontSize: 14, color: "#94A3B8", flexShrink: 0 }}>🔍</span>
            <input type="text" placeholder="Rechercher un ticket…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0F172A", width: "100%" }} />
            {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 13, padding: 0 }}>✕</button>}
          </Box>
        </Box>

        {/* Onglets */}
        <Box sx={{ display: "flex", padding: { xs: "0 12px", md: "0 24px" }, borderBottom: "1px solid #F1F5F9", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
          {TABS.map(tab => {
            const count    = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            const isRefTab = tab.key === "refused";
            return (
              <button key={tab.key} className="at-tab" onClick={() => setActiveTab(tab.key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "11px 12px",
                border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? (isRefTab ? "#DC2626" : "#2563EB") : isRefTab && count > 0 ? "#DC2626" : "#64748B",
                borderBottom: isActive ? `2.5px solid ${isRefTab ? "#DC2626" : "#2563EB"}` : "2.5px solid transparent",
                marginBottom: -1, whiteSpace: "nowrap", fontFamily: "inherit",
              }}>
                {tab.label}
                <span style={{ background: isActive ? (isRefTab ? "#DC2626" : "#2563EB") : isRefTab && count > 0 ? "#FEF2F2" : "#E2E8F0", color: isActive ? "#fff" : isRefTab && count > 0 ? "#DC2626" : "#64748B", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, border: isRefTab && count > 0 && !isActive ? "1px solid #FECACA" : "none" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </Box>

        {/* En-têtes de colonnes */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "14px", padding: "10px 18px 10px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC" }}>
          {["", "ID", "Ticket", "Catégorie", "Priorité", "Statut", "Date", "Assigné à", "Action"].map((col, i) => (
            <Box key={i} sx={{ flex: i === 2 ? 1 : undefined, width: [7,44,undefined,110,100,110,90,150,130][i], flexShrink: i !== 2 ? 0 : undefined, display: i === 3 ? { xs: "none", lg: "block" } : "block", textAlign: i === 8 ? "center" : "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              {col}
            </Box>
          ))}
        </Box>

        <Box sx={{ padding: { xs: "4px 2px 12px", md: "4px 6px 12px" } }}>
          {loading ? (
            <Box sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1,2,3,4].map(i => <Box key={i} sx={{ height: 60, borderRadius: 8, background: "#F1F5F9", animation: "pulse 1.5s ease-in-out infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }} />)}
            </Box>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
              <div className={styles.emptySub}>Modifiez vos filtres pour afficher des résultats.</div>
            </div>
          ) : visible.map((ticket, index) => (
            <TicketRow key={ticket._id || ticket.id} ticket={ticket} tech={techOf(ticket)} isLast={index === visible.length - 1} index={index} onAssign={t => { setModal(t); setSel(t.technicienId?._id || t.technicienId || null); }} />
          ))}
        </Box>
      </div>

      {/* Modal assignation */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && (setModal(null), setSel(null))} style={{ position: "fixed", inset: 0, background: "rgba(10,12,30,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, animation: "at-fadeIn .18s ease", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,0.22)", overflow: "hidden", animation: "at-slideUp .24s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  {modal.statut === "refused" ? "Réassignation" : "Assignation"}
                </p>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Choisir un technicien</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#64748B", fontWeight: 600 }}>{(modal._id || modal.id || "").toString().slice(-6).toUpperCase()}</span>
                  <span style={{ fontSize: 13, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{modal.titre}</span>
                  <Badge status={modal.priorite} />
                  <StatusBadge statut={modal.statut} />
                </div>
                {/* ✅ Motif du refus dans le modal */}
                {modal.statut === "refused" && modal.refusedReason && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#991B1B", lineHeight: 1.5 }}>
                     <strong>Motif du refus :</strong> {modal.refusedReason}
                  </div>
                )}
              </div>
              <button onClick={() => { setModal(null); setSel(null); }} style={{ border: "1.5px solid #E2E8F0", background: "#fff", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 14, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
              {techniciens.map((tech, i) => {
                const techId    = tech._id || tech.id;
                const charge    = chargeOf(techId, tickets);
                const isSel     = selectedTech === techId;
                const dispo     = charge <= 3;
                // ✅ Signale le technicien qui vient de refuser
                const isRefuser = modal.refusedBy && (modal.refusedBy?._id || modal.refusedBy)?.toString() === techId?.toString();
                return (
                  <div key={techId} className="at-tc" onClick={() => !isRefuser && setSel(techId)} style={{
                    border: `2px solid ${isRefuser ? "#FECACA" : isSel ? "#2563EB" : "#E2E8F0"}`,
                    background: isRefuser ? "#FFF5F5" : isSel ? "#EFF6FF" : "#F8FAFC",
                    opacity: isRefuser ? 0.65 : 1,
                    cursor: isRefuser ? "not-allowed" : "pointer",
                    animationDelay: `${i * 0.05}s`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={styles.avatar} style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0, background: isRefuser ? "#EF4444" : isSel ? "#2563EB" : (AVATAR_COLORS[i % AVATAR_COLORS.length]), transition: "background 0.2s" }}>
                        {tech.nom[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                          {tech.nom}
                          {isRefuser && <span style={{ fontSize: 10, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 4, padding: "1px 5px" }}>A refusé</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{tech.competences?.join(", ") ?? "Maintenance"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: charge > 3 ? "#D97706" : "#0F172A", lineHeight: 1 }}>{charge}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.4px" }}>en cours</div>
                      </div>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", display: "inline-block", flexShrink: 0, background: dispo ? "#22C55E" : "#EF4444", boxShadow: dispo ? "0 0 0 3px #DCFCE7" : "0 0 0 3px #FEE2E2" }} />
                    </div>
                    {isSel && !isRefuser && <div style={{ position: "absolute", top: 10, right: 14, width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "14px 24px 22px", borderTop: "1.5px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button label="Annuler" variant="secondary" onClick={() => { setModal(null); setSel(null); }} />
              <Button label={assigning ? "Assignation…" : modal.statut === "refused" ? "⚡ Confirmer la réassignation" : "Confirmer l'assignation"} variant="primary" onClick={confirmer} disabled={!selectedTech || assigning} />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#0F172A", color: "#fff", padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, zIndex: 2000, boxShadow: "0 10px 40px rgba(0,0,0,0.25)", animation: "at-toast .25s cubic-bezier(.22,1,.36,1)", whiteSpace: "nowrap" }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}