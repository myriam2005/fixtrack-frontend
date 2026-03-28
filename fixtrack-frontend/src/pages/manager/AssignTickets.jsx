// src/pages/manager/AssignerTicket.jsx
// ✅ FIX : handleGoValidate navigue vers /manager/resolutions
//    (correspond exactement à App.jsx : <Route path="manager/resolutions" element={<ValiderResolutions />} />)

import { useState, useEffect, useRef } from "react";
import { useNavigate }                 from "react-router-dom";
import { Box, Divider }                from "@mui/material";
import Badge                           from "../../components/common/badge/Badge";
import SkeletonLoader                  from "../../components/common/SkeletonLoader";
import Button                          from "../../components/common/Button";
import { ticketService, userService }  from "../../services/api";
import styles                          from "../employee/my-ticket/MyTickets.module.css";

const PRIORITY_LEFT_COLOR = {
  critical: "#EF4444", high: "#F59E0B", medium: "#3B82F6", low: "#9CA3AF",
};
const AVATAR_COLORS = ["#16a34a","#0d9488","#dc2626","#d97706","#7c3aed","#2563eb","#0891b2"];

const chargeOf = (techId, tickets) =>
  tickets.filter(t =>
    (t.technicienId?._id || t.technicienId) === techId &&
    ["assigned","in_progress"].includes(t.statut)
  ).length;

if (typeof document !== "undefined" && !document.getElementById("at-styles-v2")) {
  const s = document.createElement("style");
  s.id = "at-styles-v2";
  s.textContent = `
    @keyframes at-backdrop-in  { from{opacity:0} to{opacity:1} }
    @keyframes at-modal-in     { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes at-modal-out    { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(16px) scale(0.97)} }
    @keyframes at-toast-in     { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes at-toast-out    { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(16px)} }
    @keyframes at-row-in       { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
    .at-row { transition: background 0.15s; }
    .at-row:hover { background: #F8FAFF !important; }
    .at-row.refused-row { background: #FFF5F5 !important; }
    .at-row.refused-row:hover { background: #FFF0F0 !important; }
    .at-assign-btn { transition: background 0.15s, transform 0.12s, box-shadow 0.12s, opacity 0.15s !important; }
    .at-assign-btn:hover:not(:disabled) { transform: scale(1.04) !important; box-shadow: 0 4px 14px rgba(37,99,235,0.28) !important; }
    .at-assign-btn:active:not(:disabled) { transform: scale(0.97) !important; }
    .at-validate-btn { transition: background 0.15s, transform 0.12s, box-shadow 0.12s !important; }
    .at-validate-btn:hover { transform: scale(1.04) !important; box-shadow: 0 4px 14px rgba(34,197,94,0.3) !important; }
    .at-validate-btn:active { transform: scale(0.97) !important; }
    .at-tab { transition: color 0.15s, border-color 0.15s !important; }
    .at-tc-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 13px 16px; border-radius: 12px; cursor: pointer;
      transition: transform 0.18s cubic-bezier(.22,1,.36,1), box-shadow 0.18s, border-color 0.15s, background 0.15s;
      position: relative; border: 2px solid #E2E8F0; background: #F8FAFC;
    }
    .at-tc-card:hover:not(.at-tc-disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.10); }
    .at-tc-card.at-tc-selected { border-color: #2563EB !important; background: #EFF6FF !important; }
    .at-tc-card.at-tc-disabled { opacity: 0.55; cursor: not-allowed; background: #FFF5F5 !important; border-color: #FECACA !important; }
    .refused-reason-inline {
      font-size:11px; color:#991B1B; background:#FEF2F2; border:1px solid #FECACA; border-radius:5px;
      padding:2px 7px; display:inline-flex; align-items:center; gap:4px;
      max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }
  `;
  document.head.appendChild(s);
}

function StatusBadge({ statut }) {
  const map = {
    open:        { label: "Ouvert",   bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    assigned:    { label: "Assigné",  bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    in_progress: { label: "En cours", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    resolved:    { label: "Résolu",   bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
    closed:      { label: "Clôturé",  bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
    refused:     { label: "Refusé",   bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };
  const cfg = map[statut] || map.open;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

function AssignModal({ ticket, techniciens, tickets, onClose, onConfirm, assigning }) {
  const [selectedTech, setSel] = useState(ticket?.technicienId?._id || ticket?.technicienId || null);
  const [closing, setClosing]  = useState(false);
  const overlayRef             = useRef(null);
  const isRefused              = ticket?.statut === "refused";

  const handleClose = () => { setClosing(true); setTimeout(() => { setClosing(false); onClose(); }, 220); };
  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) handleClose(); };
  const handleConfirm = () => { if (!selectedTech || assigning) return; onConfirm(selectedTech, () => handleClose()); };
  if (!ticket) return null;

  return (
    <div ref={overlayRef} onClick={handleOverlayClick}
      style={{ position: "fixed", inset: 0, background: "rgba(10,12,30,0.45)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: 16, animation: "at-backdrop-in 0.18s ease" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 540, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(10,12,30,0.22), 0 2px 8px rgba(10,12,30,0.08)", overflow: "hidden", animation: closing ? "at-modal-out 0.22s cubic-bezier(.4,0,1,1) forwards" : "at-modal-in 0.26s cubic-bezier(.22,1,.36,1)" }}>
        
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px" }}>{isRefused ? "Réassignation" : "Assignation"}</p>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>Choisir un technicien</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#94A3B8", fontWeight: 700, background: "#F1F5F9", padding: "2px 7px", borderRadius: 5 }}>#{(ticket._id || ticket.id || "").toString().slice(-6).toUpperCase()}</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{ticket.titre}</span>
                <Badge status={ticket.priorite} />
                <StatusBadge statut={ticket.statut} />
              </div>
              {isRefused && ticket.refusedReason && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#991B1B", lineHeight: 1.5 }}>
                  <strong>Motif du refus :</strong> {ticket.refusedReason}
                </div>
              )}
            </div>
            <button onClick={handleClose}
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#374151"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#64748B"; }}>✕</button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 20px 4px", display: "flex", flexDirection: "column", gap: 7, flexGrow: 1 }}>
          {techniciens.map((tech, i) => {
            const techId    = tech._id || tech.id;
            const charge    = chargeOf(techId, tickets);
            const isSel     = selectedTech === techId;
            const dispo     = charge <= 3;
            const isRefuser = ticket.refusedBy && (ticket.refusedBy?._id || ticket.refusedBy)?.toString() === techId?.toString();
            return (
              <div key={techId}
                className={`at-tc-card${isSel && !isRefuser ? " at-tc-selected" : ""}${isRefuser ? " at-tc-disabled" : ""}`}
                onClick={() => !isRefuser && setSel(techId)}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: isRefuser ? "#EF4444" : isSel ? "#2563EB" : AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, transition: "background 0.18s" }}>
                    {tech.nom[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                      {tech.nom}
                      {isRefuser && <span style={{ fontSize: 10, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 4, padding: "1px 5px" }}>A refusé</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 1 }}>{tech.competences?.join(", ") || "Maintenance"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: charge > 3 ? "#D97706" : "#0F172A", lineHeight: 1 }}>{charge}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.4px" }}>en cours</div>
                  </div>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: dispo ? "#22C55E" : "#EF4444", boxShadow: dispo ? "0 0 0 3px #DCFCE7" : "0 0 0 3px #FEE2E2" }} />
                </div>
                {isSel && !isRefuser && (
                  <div style={{ position: "absolute", top: 10, right: 13, width: 18, height: 18, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button label="Annuler" variant="secondary" onClick={handleClose} />
          <Button label={assigning ? "En cours…" : isRefused ? "Confirmer la réassignation" : "Confirmer l'assignation"} variant="primary" onClick={handleConfirm} disabled={!selectedTech || assigning} />
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 2700); return () => clearTimeout(t); }, []);
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, display: "flex", alignItems: "center", gap: 10, background: toast.type === "error" ? "#DC2626" : toast.type === "warn" ? "#D97706" : "#111827", color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "0 8px 30px rgba(0,0,0,0.22)", fontSize: 13.5, fontWeight: 500, animation: visible ? "at-toast-in 0.22s cubic-bezier(.22,1,.36,1)" : "at-toast-out 0.2s ease forwards", pointerEvents: "none" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: toast.type === "error" ? "#FCA5A5" : toast.type === "warn" ? "#FCD34D" : "#22C55E" }} />
      {toast.msg}
    </div>
  );
}

function TicketRow({ ticket, tech, isLast, onAssign, onGoValidate, index }) {
  const leftColor  = PRIORITY_LEFT_COLOR[ticket.priorite] || "#E2E8F0";
  const techName   = tech?.nom || null;
  const isRefused  = ticket.statut === "refused";
  const isResolved = ticket.statut === "resolved";
  const isClosed   = ticket.statut === "closed";

  return (
    <>
      <Box className={`at-row${isRefused ? " refused-row" : ""}`}
        sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, gap: { xs: "10px", md: "14px" }, padding: { xs: "14px 12px 14px 10px", md: "13px 18px 13px 16px" }, borderLeft: `3px solid ${isRefused ? "#EF4444" : leftColor}`, borderRadius: "0 10px 10px 0", animation: `at-row-in 0.3s ease ${index * 0.04}s both`, flexWrap: { xs: "wrap", md: "nowrap" } }}>
        
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: isRefused ? "#EF4444" : leftColor, boxShadow: `0 0 0 3px ${(isRefused ? "#EF4444" : leftColor) + "22"}`, display: { xs: "none", md: "block" } }} />
        
        <Box sx={{ width: { xs: "auto", md: 44 }, flexShrink: 0 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>{(ticket._id || ticket.id || "").toString().slice(-6).toUpperCase()}</span>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: isRefused ? "#991B1B" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{ticket.titre}</div>
          <div style={{ fontSize: 11.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            📍 {ticket.localisation}
            {isRefused && ticket.refusedReason && <span className="refused-reason-inline" title={ticket.refusedReason}>{ticket.refusedReason}</span>}
          </div>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: "6px", mt: "6px", flexWrap: "wrap" }}>
            <Badge status={ticket.priorite} /><StatusBadge statut={ticket.statut} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
          </Box>
        </Box>

        <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
          <span className={styles.catBadge}>{ticket.categorie}</span>
        </Box>
        <Box sx={{ width: 100, flexShrink: 0, display: { xs: "none", md: "block" } }}><Badge status={ticket.priorite} /></Box>
        <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", md: "block" } }}><StatusBadge statut={ticket.statut} /></Box>
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

        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: 160 }, display: "flex", justifyContent: { xs: "flex-end", md: "center" } }}>
          {isClosed ? (
            <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4, padding: "7px 0" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF", flexShrink: 0 }} /> Clôturé
            </span>
          ) : isResolved ? (
            // ✅ FIX : onClick appelle onGoValidate() → navigate("/manager/resolutions")
            <button className="at-validate-btn" onClick={() => onGoValidate()}
              style={{ padding: "7px 14px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#16A34A,#15803D)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(22,163,74,0.25)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Valider
            </button>
          ) : (
            <button className="at-assign-btn" onClick={() => onAssign(ticket)}
              style={{ padding: "7px 16px", borderRadius: 999, border: "none", background: isRefused ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: isRefused ? "0 2px 8px rgba(220,38,38,0.25)" : "0 2px 8px rgba(37,99,235,0.2)" }}>
              {isRefused ? "Réassigner" : ticket.technicienId ? "Réassigner" : "Assigner"}
            </button>
          )}
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: { xs: "10px", md: "18px" } }} />}
    </>
  );
}

export default function AssignTicket() {
  const navigate                    = useNavigate();
  const [tickets,     setTickets]   = useState([]);
  const [techniciens, setTechs]     = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [search,      setSearch]    = useState("");
  const [activeTab,   setActiveTab] = useState("all");
  const [modal,       setModal]     = useState(null);
  const [toast,       setToast]     = useState(null);
  const [assigning,   setAssigning] = useState(false);
  const toastTimer                  = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ticketsData, techs] = await Promise.all([ticketService.getAll(), userService.getTechnicians()]);
        setTickets(ticketsData || []);
        setTechs(techs || []);
      } catch { /* silencieux */ }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!tickets.length) return;
    const params = new URLSearchParams(window.location.search);
    const tid    = params.get("ticketId");
    if (tid) {
      const ticket = tickets.find(t => (t._id || t.id) === tid);
      if (ticket && !["resolved", "closed"].includes(ticket.statut)) {
        setModal(ticket);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [tickets]);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const handleConfirm = async (selectedTechId, closeModal) => {
    const tech = techniciens.find(t => (t._id || t.id) === selectedTechId);
    setAssigning(true);
    try {
      const data = await ticketService.assign(modal._id || modal.id, selectedTechId);
      setTickets(prev => prev.map(t => (t._id || t.id) === (modal._id || modal.id) ? data : t));
      closeModal();
      showToast(`Ticket assigné à ${tech?.nom}`);
    } catch {
      showToast("Erreur lors de l'assignation", "error");
    } finally {
      setAssigning(false);
    }
  };

  // ✅ THE FIX — chemin absolu qui correspond à App.jsx
  const handleGoValidate = () => navigate("/manager/resolutions");

  const TABS = [
    { key: "all",         label: "Tous"      },
    { key: "open",        label: "Ouverts"   },
    { key: "assigned",    label: "Assignés"  },
    { key: "in_progress", label: "En cours"  },
    { key: "refused",     label: "Refusés"   },
    { key: "resolved",    label: "Résolus"   },
    { key: "closed",      label: "Clôturés"  },
  ];

  const tabCounts = {};
  TABS.forEach(t => { tabCounts[t.key] = t.key === "all" ? tickets.length : tickets.filter(tk => tk.statut === t.key).length; });

  const visible = tickets.filter(t => {
    const inTab    = activeTab === "all" || t.statut === activeTab;
    const inSearch = !search || t.titre?.toLowerCase().includes(search.toLowerCase()) || t.localisation?.toLowerCase().includes(search.toLowerCase()) || t.categorie?.toLowerCase().includes(search.toLowerCase());
    return inTab && inSearch;
  });

  const techOf = (ticket) => {
    const techId = ticket.technicienId?._id || ticket.technicienId;
    return techId ? techniciens.find(u => (u._id || u.id) === techId) : null;
  };

  const refusedCount  = tickets.filter(t => t.statut === "refused").length;
  const resolvedCount = tickets.filter(t => t.statut === "resolved").length;

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
            {!loading && refusedCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 20, background: "#FEF2F2", color: "#DC2626", fontSize: 13, fontWeight: 700, border: "1px solid #FECACA" }}>
                {refusedCount} refusé{refusedCount > 1 ? "s" : ""} — à réassigner
              </span>
            )}
            {!loading && resolvedCount > 0 && (
              <span onClick={handleGoValidate}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 20, background: "#F0FDF4", color: "#16A34A", fontSize: 13, fontWeight: 700, border: "1px solid #BBF7D0", cursor: "pointer", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#DCFCE7"}
                onMouseOut={e => e.currentTarget.style.background = "#F0FDF4"}>
                {resolvedCount} résolu{resolvedCount > 1 ? "s" : ""} — en attente de validation
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
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "8px 14px", width: { xs: "100%", sm: "280px" }, "&:focus-within": { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }, transition: "all 0.15s" }}>
            <span style={{ fontSize: 14, color: "#94A3B8" }}>🔍</span>
            <input type="text" placeholder="Rechercher un ticket…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0F172A", width: "100%", fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>}
          </Box>
        </Box>

        <Box sx={{ display: "flex", padding: { xs: "0 12px", md: "0 24px" }, borderBottom: "1px solid #F1F5F9", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
          {TABS.map(tab => {
            const count = tabCounts[tab.key]; const isActive = activeTab === tab.key;
            const isRef = tab.key === "refused"; const isRes = tab.key === "resolved";
            return (
              <button key={tab.key} className="at-tab" onClick={() => setActiveTab(tab.key)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? (isRef ? "#DC2626" : isRes ? "#16A34A" : "#2563EB") : isRef && count > 0 ? "#DC2626" : isRes && count > 0 ? "#16A34A" : "#64748B", borderBottom: isActive ? `2.5px solid ${isRef ? "#DC2626" : isRes ? "#16A34A" : "#2563EB"}` : "2.5px solid transparent", marginBottom: -1, whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {tab.label}
                <span style={{ background: isActive ? (isRef ? "#DC2626" : isRes ? "#16A34A" : "#2563EB") : isRef && count > 0 ? "#FEF2F2" : isRes && count > 0 ? "#F0FDF4" : "#E2E8F0", color: isActive ? "#fff" : isRef && count > 0 ? "#DC2626" : isRes && count > 0 ? "#16A34A" : "#64748B", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, border: isRef && count > 0 && !isActive ? "1px solid #FECACA" : isRes && count > 0 && !isActive ? "1px solid #BBF7D0" : "none" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "14px", padding: "10px 18px 10px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC" }}>
          {["", "ID", "Ticket", "Catégorie", "Priorité", "Statut", "Date", "Assigné à", "Action"].map((col, i) => (
            <Box key={i} sx={{ flex: i === 2 ? 1 : undefined, width: [7,44,undefined,110,100,110,90,150,160][i], flexShrink: i !== 2 ? 0 : undefined, display: i === 3 ? { xs: "none", lg: "block" } : "block", textAlign: i === 8 ? "center" : "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>{col}</Box>
          ))}
        </Box>

        <Box sx={{ padding: { xs: "4px 2px 12px", md: "4px 6px 12px" } }}>
          {loading ? (
            <Box sx={{ p: "20px" }}>
              <SkeletonLoader type="block" height={60} count={4} gap={12} />
            </Box>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
              <div className={styles.emptySub}>Modifiez vos filtres pour afficher des résultats.</div>
            </div>
          ) : visible.map((ticket, index) => (
            <TicketRow key={ticket._id || ticket.id} ticket={ticket} tech={techOf(ticket)} isLast={index === visible.length - 1} index={index} onAssign={t => setModal(t)} onGoValidate={handleGoValidate} />
          ))}
        </Box>
      </div>

      {modal && <AssignModal ticket={modal} techniciens={techniciens} tickets={tickets} onClose={() => setModal(null)} onConfirm={handleConfirm} assigning={assigning} />}
      {toast && <Toast toast={toast} />}
    </div>
  );
}