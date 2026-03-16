// src/pages/manager/AssignerTicket.jsx
import { useState } from "react";
import { Box, Divider } from "@mui/material";
import { tickets as initialTickets, users, mockNotifications } from "../../data/mockData";
import Badge from "../../components/common/badge/Badge";
import Button from "../../components/common/Button";
import styles from "../employee/my-ticket/MyTickets.module.css";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const PRIORITY_LEFT_COLOR = {
  critical: "#EF4444", high: "#F59E0B", medium: "#3B82F6", low: "#9CA3AF",
};

const techniciens = users.filter((u) => u.role === "technician");

const AVATAR_COLORS = {
  u1: "#16a34a", u2: "#0d9488", u3: "#dc2626", u4: "#d97706", u5: "#7c3aed",
};

const chargeOf = (techId, ticketsList) =>
  ticketsList.filter(
    (t) => t.technicienId === techId && ["assigned", "in_progress"].includes(t.statut)
  ).length;

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
    .at-assign-btn { transition: background 0.15s, transform 0.12s, box-shadow 0.12s !important; }
    .at-assign-btn:hover { transform: scale(1.04) !important; box-shadow: 0 4px 14px rgba(37,99,235,0.25) !important; }
    .at-assign-btn:active { transform: scale(0.97) !important; }
    .at-tab { transition: color 0.15s, border-color 0.15s !important; }
    .at-tab:hover { color: #2563EB !important; }
  `;
  document.head.appendChild(s);
}

// ─── TicketRow ────────────────────────────────────────────────────────────────
function TicketRow({ ticket, tech, isLast, onAssign, index }) {
  const leftColor = PRIORITY_LEFT_COLOR[ticket.priorite] || "#E2E8F0";

  return (
    <>
      <Box
        className="at-row"
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: "10px", md: "14px" },
          padding: { xs: "14px 12px 14px 10px", md: "13px 18px 13px 16px" },
          borderLeft: `3px solid ${leftColor}`,
          borderRadius: "0 10px 10px 0",
          animation: `at-rowIn 0.3s ease ${index * 0.04}s both`,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* ● dot — hidden on mobile */}
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: leftColor,
          boxShadow: `0 0 0 3px ${leftColor}22`,
          display: { xs: "none", md: "block" },
          mt: { xs: "6px", md: 0 },
        }} />

        {/* ID */}
        <Box sx={{ width: { xs: "auto", md: 44 }, flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>
            {ticket.id}
          </span>
        </Box>

        {/* Titre + localisation */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
            {ticket.titre}
          </div>
          <div style={{ fontSize: 11.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}>
            📍 {ticket.localisation}
          </div>
          {/* Mobile meta row */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: "6px", mt: "6px", flexWrap: "wrap" }}>
            <Badge status={ticket.priorite} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{ticket.dateCreation}</span>
          </Box>
        </Box>

        {/* Catégorie — hidden on mobile */}
        <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
          <span className={styles.catBadge}>{ticket.categorie}</span>
        </Box>

        {/* Priorité — hidden on mobile */}
        <Box sx={{ width: 100, flexShrink: 0, display: { xs: "none", md: "block" } }}>
          <Badge status={ticket.priorite} />
        </Box>

        {/* Date — hidden on mobile */}
        <Box sx={{ width: 90, flexShrink: 0, display: { xs: "none", md: "block" } }}>
          <span className={styles.date}>{ticket.dateCreation}</span>
        </Box>

        {/* Technicien */}
        <Box sx={{ width: { xs: "auto", md: 150 }, flexShrink: 0 }}>
          {tech ? (
            <div className={styles.techWrap}>
              <div className={styles.avatar} style={{ background: AVATAR_COLORS[tech.id] || "#6366F1" }}>
                {tech.nom[0].toUpperCase()}
              </div>
              <span className={styles.techName}>{tech.nom}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>Non assigné</span>
          )}
        </Box>

        {/* Action */}
        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: 130 }, display: "flex", justifyContent: { xs: "flex-end", md: "center" } }}>
          <button
            className="at-assign-btn"
            onClick={() => onAssign(ticket)}
            style={{
              padding: "7px 18px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            }}
          >
            {ticket.technicienId ? "Réassigner" : "Assigner"}
          </button>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: { xs: "10px", md: "18px" } }} />}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssignTicket() {
  const [tickets,      setTickets]  = useState([...initialTickets]);
  const [search,       setSearch]   = useState("");
  const [activeTab,    setActiveTab]= useState("all");
  const [modal,        setModal]    = useState(null);
  const [selectedTech, setSel]      = useState(null);
  const [toast,        setToast]    = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const confirmer = () => {
    if (!selectedTech || !modal) return;
    const tech = techniciens.find((t) => t.id === selectedTech);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === modal.id ? { ...t, technicienId: selectedTech, statut: "assigned" } : t
      )
    );
    mockNotifications.push({
      id: `n${Date.now()}`, userId: selectedTech,
      message: `Nouveau ticket assigné : ${modal.titre}`,
      type: "ticket_assigned", lu: false, ticketId: modal.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setModal(null); setSel(null);
    showToast(`Ticket assigné à ${tech.nom}`);
  };

  const tabCounts = {
    all:         tickets.length,
    open:        tickets.filter((t) => t.statut === "open").length,
    assigned:    tickets.filter((t) => t.statut === "assigned").length,
    in_progress: tickets.filter((t) => t.statut === "in_progress").length,
    resolved:    tickets.filter((t) => t.statut === "resolved").length,
    closed:      tickets.filter((t) => t.statut === "closed").length,
  };

  const visible = tickets.filter((t) => {
    const inTab    = activeTab === "all" || t.statut === activeTab;
    const inSearch = search === "" ||
      t.titre.toLowerCase().includes(search.toLowerCase()) ||
      t.categorie.toLowerCase().includes(search.toLowerCase()) ||
      t.localisation.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return inTab && inSearch;
  });

  const techOf = (ticket) =>
    ticket.technicienId ? users.find((u) => u.id === ticket.technicienId) : null;

  const TABS = [
    { key: "all",         label: "Tous" },
    { key: "open",        label: "Ouverts" },
    { key: "assigned",    label: "Assignés" },
    { key: "in_progress", label: "En cours" },
    { key: "resolved",    label: "Résolus" },
    { key: "closed",      label: "Clôturés" },
  ];

  return (
    <div className={styles.root} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageEyebrow}>Manager · Assignation</span>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 className={styles.pageTitle}>Assignation des tickets</h1>
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 10px", borderRadius: 20,
              background: "#F1F5F9", color: "#64748B",
              fontSize: 13, fontWeight: 500,
            }}>
              {tickets.length} ticket(s)
            </span>
          </Box>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>

        {/* Top Bar */}
        <Box sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          gap: "12px",
          padding: { xs: "16px 16px 12px", md: "20px 24px 16px" },
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
              Liste des tickets
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94A3B8" }}>
              {visible.length} ticket{visible.length !== 1 ? "s" : ""} affichés
            </p>
          </div>

          {/* Search */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: "10px", padding: "8px 14px",
            width: { xs: "100%", sm: "290px" },
            transition: "border-color 0.15s, box-shadow 0.15s",
            "&:focus-within": { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" },
          }}>
            <span style={{ fontSize: 14, color: "#94A3B8", flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un ticket…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0F172A", width: "100%" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 13, padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#374151"}
                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
              >✕</button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          display: "flex",
          padding: { xs: "0 12px", md: "0 24px" },
          borderBottom: "1px solid #F1F5F9",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          gap: 0,
        }}>
          {TABS.map((tab) => {
            const count    = tabCounts[tab.key];
            if (count === 0 && tab.key !== "all") return null;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className="at-tab"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "11px 12px", border: "none", background: "transparent",
                  cursor: "pointer", fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2563EB" : "#64748B",
                  borderBottom: isActive ? "2.5px solid #2563EB" : "2.5px solid transparent",
                  marginBottom: -1, whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {tab.label}
                <span style={{
                  background: isActive ? "#2563EB" : "#E2E8F0",
                  color: isActive ? "#fff" : "#64748B",
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 7px", borderRadius: 99,
                  transition: "background 0.15s, color 0.15s",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </Box>

        {/* Column headers — desktop only */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "14px", padding: "10px 18px 10px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC" }}>
          {[
            { label: "",          w: 7   },
            { label: "ID",        w: 44  },
            { label: "Ticket",    flex: 1 },
            { label: "Catégorie", w: 110, hideXl: false },
            { label: "Priorité",  w: 100 },
            { label: "Date",      w: 90  },
            { label: "Assigné à", w: 150 },
            { label: "Action",    w: 130, center: true },
          ].map((col, i) => (
            <Box key={i} sx={{
              width: col.w, flex: col.flex,
              flexShrink: col.flex ? undefined : 0,
              minWidth: col.flex ? 0 : undefined,
              display: col.hideXl === false ? { xs: "none", lg: "block" } : "block",
              textAlign: col.center ? "center" : "left",
              fontSize: 11, fontWeight: 700, color: "#94A3B8",
              textTransform: "uppercase", letterSpacing: "0.6px",
            }}>
              {col.label}
            </Box>
          ))}
        </Box>

        {/* ── Rows ── */}
        <Box sx={{ padding: { xs: "4px 2px 12px", md: "4px 6px 12px" } }}>
          {visible.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
              <div className={styles.emptySub}>Modifiez vos filtres pour afficher des résultats.</div>
            </div>
          ) : visible.map((ticket, index) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              tech={techOf(ticket)}
              isLast={index === visible.length - 1}
              index={index}
              onAssign={(t) => { setModal(t); setSel(t.technicienId || null); }}
            />
          ))}
        </Box>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          onClick={(e) => e.target === e.currentTarget && (setModal(null), setSel(null))}
          style={{
            position: "fixed", inset: 0, background: "rgba(10,12,30,0.5)",
            backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1200,
            animation: "at-fadeIn .18s ease",
            padding: "16px",
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20,
            width: "100%", maxWidth: 560,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 32px 100px rgba(0,0,0,0.22)", overflow: "hidden",
            animation: "at-slideUp .24s cubic-bezier(.22,1,.36,1)",
          }}>

            {/* Modal Header */}
            <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Assignation</p>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Choisir un technicien</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#64748B", fontWeight: 600 }}>{modal.id}</span>
                  <span style={{ fontSize: 13, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{modal.titre}</span>
                  <Badge status={modal.priorite} />
                </div>
              </div>
              <button
                onClick={() => { setModal(null); setSel(null); }}
                style={{ border: "1.5px solid #E2E8F0", background: "#fff", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 14, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#0F172A"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748B"; }}
              >✕</button>
            </div>

            {/* Tech List */}
            <div style={{ overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
              {techniciens.map((tech, i) => {
                const charge = chargeOf(tech.id, tickets);
                const isSel  = selectedTech === tech.id;
                const dispo  = charge <= 3;
                return (
                  <div
                    key={tech.id}
                    className="at-tc"
                    onClick={() => setSel(tech.id)}
                    style={{
                      border: `2px solid ${isSel ? "#2563EB" : "#E2E8F0"}`,
                      background: isSel ? "#EFF6FF" : "#F8FAFC",
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={styles.avatar} style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0, background: isSel ? "#2563EB" : (AVATAR_COLORS[tech.id] || "#6366F1"), transition: "background 0.2s" }}>
                        {tech.nom[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{tech.nom}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{tech.competences?.join(", ") ?? "Maintenance"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: charge > 3 ? "#D97706" : "#0F172A", lineHeight: 1 }}>{charge}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.4px" }}>en cours</div>
                      </div>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", display: "inline-block", flexShrink: 0, background: dispo ? "#22C55E" : "#EF4444", boxShadow: dispo ? "0 0 0 3px #DCFCE7" : "0 0 0 3px #FEE2E2", transition: "all 0.2s" }} />
                    </div>
                    {isSel && (
                      <div style={{ position: "absolute", top: 10, right: 14, width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px 22px", borderTop: "1.5px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button label="Annuler" variant="secondary" onClick={() => { setModal(null); setSel(null); }} />
              <Button label="Confirmer l'assignation" variant="primary" onClick={confirmer} disabled={!selectedTech} />
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "#0F172A", color: "#fff", padding: "13px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
          zIndex: 2000, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          animation: "at-toast .25s cubic-bezier(.22,1,.36,1)", whiteSpace: "nowrap",
        }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}