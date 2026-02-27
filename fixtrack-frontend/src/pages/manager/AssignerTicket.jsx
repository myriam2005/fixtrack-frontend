// src/pages/manager/AssignerTicket.jsx
import { useState } from "react";
import { tickets, users, notifications } from "../../data/mockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const techniciens = users.filter((u) => u.role === "technician");

const PRIORITY = {
  critical: { label: "Critique", bg: "#fff0f0", color: "#b91c1c", dot: "#ef4444" },
  high:     { label: "Haute",    bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  medium:   { label: "Moyenne",  bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  low:      { label: "Basse",    bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};

const STATUS = {
  open:     { label: "Ouvert",  bg: "#eff6ff", color: "#1d4ed8" },
  assigned: { label: "Assigné", bg: "#faf5ff", color: "#7c3aed" },
};

// Nombre de tickets "assigned" ou "in_progress" d'un technicien
const chargeOf = (techId) =>
  tickets.filter(
    (t) => t.technicienId === techId && ["assigned", "in_progress"].includes(t.statut)
  ).length;

// Inject animations une seule fois
if (typeof document !== "undefined" && !document.getElementById("at-kf")) {
  const s = document.createElement("style");
  s.id = "at-kf";
  s.textContent = `
    @keyframes at-fade { from{opacity:0} to{opacity:1} }
    @keyframes at-up   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes at-toast{ from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    .at-row:hover td { background:#f8faff !important; }
    .at-tc:hover     { border-color:#bfdbfe !important; background:#f0f7ff !important; }
  `;
  document.head.appendChild(s);
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignerTicket() {
  // On travaille sur une copie locale réactive ; les mutations s'appliquent
  // aussi sur le tableau tickets[] importé (même référence d'objet).
  const [, forceRender] = useState(0);
  const refresh = () => forceRender((n) => n + 1);

  const [filter,       setFilter]       = useState("all");
  const [modalTicket,  setModalTicket]  = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [toast,        setToast]        = useState(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  const openModal  = (ticket) => { setModalTicket(ticket); setSelectedTech(null); };
  const closeModal = ()       => { setModalTicket(null);   setSelectedTech(null); };

  const confirmer = () => {
    if (!selectedTech || !modalTicket) return;
    const tech = techniciens.find((t) => t.id === selectedTech);

    // ── Mutation mockData.js (référence directe) ───────────────────────────
    const idx = tickets.findIndex((t) => t.id === modalTicket.id);
    if (idx !== -1) {
      tickets[idx].technicienId = selectedTech;
      tickets[idx].statut       = "assigned";
    }

    // Ajouter une notification (optionnel)
    notifications.push({
      id:       `n${Date.now()}`,
      userId:   selectedTech,
      message:  `Nouveau ticket assigné : ${modalTicket.titre}`,
      type:     "ticket_assigned",
      lu:       false,
      ticketId: modalTicket.id,
      date:     new Date().toISOString().slice(0, 10),
    });
    // ──────────────────────────────────────────────────────────────────────

    closeModal();
    refresh();
    showToast(`Ticket assigné à ${tech.nom}`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Données filtrées ───────────────────────────────────────────────────────
  const visible = tickets.filter(
    (t) =>
      (t.statut === "open" || t.statut === "assigned") &&
      (filter === "all" || t.statut === filter)
  );

  const userOf   = (id) => users.find((u) => u.id === id) ?? null;
  const techOf   = (ticket) => ticket.technicienId ? userOf(ticket.technicienId) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Assignation des tickets</h1>
          <p style={S.subtitle}>Distribuez les tickets ouverts à votre équipe technique</p>
        </div>
        <div style={S.statsRow}>
          <StatChip label="Ouverts"  value={tickets.filter((t) => t.statut === "open").length}     color="#1d4ed8" />
          <StatChip label="Assignés" value={tickets.filter((t) => t.statut === "assigned").length} color="#7c3aed" />
        </div>
      </div>

      {/* ── Filtres ── */}
      <div style={S.filterBar}>
        {[
          { key: "all",      label: "Tous"     },
          { key: "open",     label: "Ouverts"  },
          { key: "assigned", label: "Assignés" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{ ...S.filterBtn, ...(filter === key ? S.filterOn : {}) }}
          >
            {label}
          </button>
        ))}
        <span style={S.countLabel}>{visible.length} ticket{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Table ── */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {["ID", "Titre", "Catégorie", "Priorité", "Statut", "Localisation", "Technicien", "Action"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket, i) => {
              const p    = PRIORITY[ticket.priorite] ?? PRIORITY.medium;
              const s    = STATUS[ticket.statut];
              const tech = techOf(ticket);
              return (
                <tr
                  key={ticket.id}
                  className="at-row"
                  style={{ borderBottom: "1px solid #f0f2f5", animation: `at-fade .3s ease ${i * 45}ms both` }}
                >
                  <td style={S.td}>
                    <span style={S.idBadge}>{ticket.id}</span>
                  </td>
                  <td style={{ ...S.td, fontWeight: 600, color: "#111827", maxWidth: 200 }}>
                    <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {ticket.titre}
                    </div>
                  </td>
                  <td style={{ ...S.td, color: "#6b7280", fontSize: 13 }}>{ticket.categorie}</td>
                  <td style={S.td}>
                    <span style={{ ...S.pill, background: p.bg, color: p.color }}>
                      <span style={{ ...S.dot, background: p.dot }} />
                      {p.label}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.pill, background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td style={{ ...S.td, fontSize: 13, color: "#6b7280", maxWidth: 160 }}>
                    <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {ticket.localisation}
                    </div>
                  </td>
                  <td style={S.td}>
                    {tech
                      ? <div style={S.techRow}><Av name={tech.nom} size={26} /><span style={{ fontSize: 13 }}>{tech.nom}</span></div>
                      : <span style={{ color: "#d1d5db", fontSize: 18 }}>—</span>
                    }
                  </td>
                  <td style={S.td}>
                    <button style={S.btnAssign} onClick={() => openModal(ticket)}>
                      {ticket.statut === "assigned" ? "Réassigner" : "Assigner"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={S.empty}>Aucun ticket à afficher pour ce filtre.</div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalTicket && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={S.modal}>

            {/* Header modal */}
            <div style={S.mHead}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={S.mLabel}>Assignation</p>
                <h2 style={S.mTitle}>Choisir un technicien</h2>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6, flexWrap:"wrap" }}>
                  <span style={S.idBadge}>{modalTicket.id}</span>
                  <span style={{ fontSize:13, color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {modalTicket.titre}
                  </span>
                </div>
              </div>
              <button style={S.closeBtn} onClick={closeModal} aria-label="Fermer">✕</button>
            </div>

            {/* Liste techniciens */}
            <div style={S.techList}>
              {techniciens.map((tech) => {
                const charge     = chargeOf(tech.id);
                const isSelected = selectedTech === tech.id;
                // "disponible" = charge ≤ 3
                const disponible = charge <= 3;
                return (
                  <div
                    key={tech.id}
                    className="at-tc"
                    onClick={() => setSelectedTech(tech.id)}
                    style={{ ...S.techCard, ...(isSelected ? S.techOn : {}) }}
                  >
                    {/* Left */}
                    <div style={S.tcLeft}>
                      <Av name={tech.nom} size={44} selected={isSelected} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{tech.nom}</div>
                        <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>
                          {tech.competences?.join(", ") ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div style={S.tcRight}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontWeight:800, fontSize:22, color: charge > 3 ? "#d97706" : "#111827", lineHeight:1 }}>
                          {charge}
                        </div>
                        <div style={{ fontSize:10, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.4px" }}>
                          en cours
                        </div>
                      </div>
                      <span
                        title={disponible ? "Disponible" : "Surchargé"}
                        style={{
                          width:13, height:13, borderRadius:"50%", display:"inline-block", flexShrink:0,
                          background: disponible ? "#22c55e" : "#ef4444",
                          boxShadow:  disponible ? "0 0 0 3px #dcfce7" : "0 0 0 3px #fee2e2",
                        }}
                      />
                    </div>

                    {isSelected && <div style={S.check}>✓</div>}
                  </div>
                );
              })}
            </div>

            {/* Footer modal */}
            <div style={S.mFoot}>
              <button style={S.btnCancel} onClick={closeModal}>Annuler</button>
              <button
                style={{ ...S.btnConfirm, opacity: selectedTech ? 1 : 0.4, cursor: selectedTech ? "pointer" : "not-allowed" }}
                onClick={confirmer}
                disabled={!selectedTech}
              >
                Confirmer l'assignation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={S.toast}>
          <span style={S.toastIcon}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Sous-composants ──────────────────────────────────────────────────────── */
function Av({ name = "?", size = 32, selected = false }) {
  return (
    <span style={{
      width: size, height: size, borderRadius:"50%", flexShrink:0,
      background: selected ? "#1d4ed8" : "#e0e7ff",
      color:      selected ? "#fff"    : "#3b5bdb",
      fontWeight: 700, fontSize: size * 0.38,
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      transition:"background .15s, color .15s",
    }}>
      {name[0].toUpperCase()}
    </span>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"10px 22px", background:"#fff", borderRadius:12,
      border:`1.5px solid ${color}22`, minWidth:80,
    }}>
      <span style={{ fontSize:24, fontWeight:800, color, lineHeight:1 }}>{value}</span>
      <span style={{ fontSize:11, color:"#9ca3af", marginTop:2, textTransform:"uppercase", letterSpacing:"0.4px" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page:      { minHeight:"100vh", background:"#f5f6fa", padding:"32px 36px", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  header:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 },
  title:     { margin:0, fontSize:26, fontWeight:800, color:"#111827", letterSpacing:"-0.5px" },
  subtitle:  { margin:"4px 0 0", color:"#9ca3af", fontSize:14 },
  statsRow:  { display:"flex", gap:12 },

  filterBar:  { display:"flex", alignItems:"center", gap:8, marginBottom:18, flexWrap:"wrap" },
  filterBtn:  {
    padding:"7px 18px", borderRadius:8, border:"1.5px solid #e5e7eb",
    background:"#fff", color:"#6b7280", fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
  },
  filterOn:   { background:"#111827", color:"#fff", borderColor:"#111827" },
  countLabel: { marginLeft:"auto", fontSize:13, color:"#9ca3af" },

  card:  { background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", overflow:"hidden" },
  table: { width:"100%", borderCollapse:"collapse" },
  th:    {
    padding:"13px 16px", textAlign:"left", fontSize:11, fontWeight:700,
    color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px",
    borderBottom:"2px solid #f3f4f6", background:"#fafafa",
  },
  td:    { padding:"13px 16px", fontSize:14, verticalAlign:"middle", background:"transparent", transition:"background .1s" },

  idBadge: {
    display:"inline-block", padding:"2px 8px", borderRadius:6,
    background:"#eff6ff", color:"#2563eb", fontSize:12, fontWeight:700, fontFamily:"monospace",
  },
  pill:    { display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
  dot:     { width:7, height:7, borderRadius:"50%", flexShrink:0 },
  techRow: { display:"flex", alignItems:"center", gap:8 },
  btnAssign: {
    padding:"6px 16px", background:"#111827", color:"#fff", border:"none",
    borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer",
    fontFamily:"inherit", transition:"opacity .15s",
  },
  empty: { textAlign:"center", padding:"48px 0", color:"#d1d5db", fontSize:15 },

  // Modal
  overlay: {
    position:"fixed", inset:0, background:"rgba(10,12,30,0.5)", backdropFilter:"blur(5px)",
    display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200,
    animation:"at-fade .15s ease",
  },
  modal: {
    background:"#fff", borderRadius:20, width:540, maxWidth:"95vw", maxHeight:"88vh",
    display:"flex", flexDirection:"column", boxShadow:"0 30px 90px rgba(0,0,0,0.2)",
    overflow:"hidden", animation:"at-up .22s ease",
  },
  mHead: {
    padding:"24px 28px 20px", borderBottom:"1.5px solid #f3f4f6",
    display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12,
  },
  mLabel: { margin:"0 0 2px", fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px" },
  mTitle: { margin:0, fontSize:19, fontWeight:800, color:"#111827" },
  closeBtn: {
    background:"#f3f4f6", border:"none", borderRadius:"50%", width:34, height:34,
    cursor:"pointer", fontSize:13, color:"#6b7280", flexShrink:0,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  techList: { overflowY:"auto", padding:"16px 24px", display:"flex", flexDirection:"column", gap:10, flexGrow:1 },
  techCard: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"14px 16px", borderRadius:12, border:"2px solid #f3f4f6",
    cursor:"pointer", transition:"all .15s", background:"#fafafa", position:"relative",
  },
  techOn:  { border:"2px solid #2563eb", background:"#eff6ff" },
  tcLeft:  { display:"flex", alignItems:"center", gap:12 },
  tcRight: { display:"flex", alignItems:"center", gap:18 },
  check: {
    position:"absolute", top:10, right:14, width:20, height:20, borderRadius:"50%",
    background:"#2563eb", color:"#fff", fontSize:11, fontWeight:900,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  mFoot: {
    padding:"16px 28px 24px", borderTop:"1.5px solid #f3f4f6",
    display:"flex", justifyContent:"flex-end", gap:10,
  },
  btnCancel: {
    padding:"10px 22px", borderRadius:10, border:"1.5px solid #e5e7eb",
    background:"#fff", color:"#6b7280", fontFamily:"inherit", fontSize:14, fontWeight:600, cursor:"pointer",
  },
  btnConfirm: {
    padding:"10px 26px", borderRadius:10, border:"none",
    background:"#111827", color:"#fff", fontFamily:"inherit",
    fontSize:14, fontWeight:700, transition:"opacity .15s",
  },

  // Toast
  toast: {
    position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
    background:"#111827", color:"#fff", padding:"14px 26px", borderRadius:12,
    fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:10,
    zIndex:2000, boxShadow:"0 10px 40px rgba(0,0,0,0.25)",
    animation:"at-toast .25s ease", fontFamily:"'DM Sans','Segoe UI',sans-serif",
    whiteSpace:"nowrap",
  },
  toastIcon: {
    width:24, height:24, borderRadius:"50%", background:"#22c55e",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:13, fontWeight:900, color:"#fff",
  },
};
