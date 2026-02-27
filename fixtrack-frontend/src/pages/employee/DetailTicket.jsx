// src/pages/employee/DetailTicket.jsx
// Utilisable comme modal depuis n'importe quelle liste de tickets :
//   <DetailTicket ticketId="t1" onClose={() => setOpen(false)} />
// OU comme page autonome via useParams (route /:id)

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tickets, users } from "../../data/mockData";

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY = {
  critical: { label: "Critique",  dot: "#ef4444", color: "#991b1b", bg: "#fef2f2" },
  high:     { label: "Haute",     dot: "#f97316", color: "#9a3412", bg: "#fff7ed" },
  medium:   { label: "Moyenne",   dot: "#eab308", color: "#854d0e", bg: "#fefce8" },
  low:      { label: "Basse",     dot: "#22c55e", color: "#166534", bg: "#f0fdf4" },
};

const STATUS = {
  open:        { label: "Ouvert",        dot: "#3b82f6", color: "#1e40af", bg: "#eff6ff" },
  assigned:    { label: "Assigné",       dot: "#a855f7", color: "#6b21a8", bg: "#faf5ff" },
  in_progress: { label: "En cours",      dot: "#f97316", color: "#9a3412", bg: "#fff7ed" },
  resolved:    { label: "Résolu",        dot: "#22c55e", color: "#166534", bg: "#f0fdf4" },
  closed:      { label: "Clôturé",       dot: "#9ca3af", color: "#374151", bg: "#f9fafb" },
};

function buildTimeline(ticket) {
  const tech   = ticket.technicienId ? users.find((u) => u.id === ticket.technicienId) : null;
  const auteur = users.find((u) => u.id === ticket.auteurId);
  const lines  = [];

  lines.push({
    icon: "📋",
    titre: "Ticket créé",
    date: ticket.dateCreation,
    desc: `Signalé par ${auteur?.nom ?? "un employé"}`,
  });

  if (tech) {
    lines.push({
      icon: "👤",
      titre: "Technicien assigné",
      date: ticket.dateCreation,
      desc: `Assigné à ${tech.nom}`,
    });
  }

  if (["in_progress", "resolved", "closed"].includes(ticket.statut)) {
    lines.push({
      icon: "🔧",
      titre: "Prise en charge",
      date: ticket.dateCreation,
      desc: "Intervention débutée par le technicien.",
    });
  }

  ticket.notes?.forEach((note) => {
    lines.push({ icon: "📝", titre: "Note ajoutée", date: ticket.dateCreation, desc: note });
  });

  if (ticket.statut === "resolved") {
    lines.push({ icon: "✅", titre: "Résolu", date: ticket.dateCreation, desc: "En attente de votre validation." });
  }
  if (ticket.statut === "closed") {
    lines.push({ icon: "🔒", titre: "Clôturé", date: ticket.dateCreation, desc: "Ticket fermé après validation." });
  }

  return lines;
}

// Inject styles once
if (typeof document !== "undefined" && !document.getElementById("dt-kf")) {
  const s = document.createElement("style");
  s.id = "dt-kf";
  s.textContent = `
    @keyframes dt-bg  { from{opacity:0} to{opacity:1} }
    @keyframes dt-box { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    .dt-close:hover { background:#e5e7eb !important; }
    .dt-send:hover  { opacity:.85; }
    .dt-star:hover  { transform:scale(1.3) !important; }
  `;
  document.head.appendChild(s);
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Composant principal ───────────────────────────────────────────────────────
// Props : ticketId + onClose  → mode modal (appelé depuis une liste)
// Aucun prop                  → mode page (lit useParams)
export default function DetailTicket({ ticketId: propId, onClose: propClose } = {}) {
  const params    = useParams();
  const navigate  = useNavigate();
  const id        = propId ?? params.id;
  const onClose   = propClose ?? (() => navigate(-1));

  const ticket    = tickets.find((t) => t.id === id);
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  const handleFeedback     = () => { if (rating) setSubmitted(true); };

  // ── 404 ──────────────────────────────────────────────────────────────────────
  const content = ticket ? renderModal() : renderNotFound();

  // Si utilisé comme page (pas de propClose) → entourer d'un overlay
  if (!propClose) {
    return (
      <div style={S.overlay} onClick={handleOverlayClick}>
        {content}
      </div>
    );
  }
  // Si utilisé depuis une liste → afficher directement dans le portail parent
  return (
    <div style={S.overlay} onClick={handleOverlayClick}>
      {content}
    </div>
  );

  function renderNotFound() {
    return (
      <div style={S.box}>
        <div style={S.header}>
          <div>
            <h2 style={S.headerTitle}>Ticket introuvable</h2>
            <p style={{ margin:0, color:"#93c5fd", fontSize:13 }}>ID : {id}</p>
          </div>
          <button style={S.closeBtn} className="dt-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:"40px 24px", textAlign:"center", color:"#6b7280" }}>
          Aucun ticket ne correspond à cet identifiant.
        </div>
      </div>
    );
  }

  function renderModal() {
    const p      = PRIORITY[ticket.priorite] ?? PRIORITY.medium;
    const s      = STATUS[ticket.statut]     ?? STATUS.open;
    const tech   = ticket.technicienId ? users.find((u) => u.id === ticket.technicienId) : null;
    const tl     = buildTimeline(ticket);

    return (
      <div style={S.box}>

        {/* ── Header bleu foncé ── */}
        <div style={S.header}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={S.headerSub}>{ticket.categorie}</p>
            <h2 style={S.headerTitle}>{ticket.id.toUpperCase()} — Détail du ticket</h2>
          </div>
          <button style={S.closeBtn} className="dt-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* ── Corps ── */}
        <div style={S.body}>

          {/* Colonne gauche */}
          <div style={S.colLeft}>

            {/* Badges + date */}
            <div style={S.badgeRow}>
              <PillBadge label={p.label} dot={p.dot} color={p.color} bg={p.bg} />
              <PillBadge label={s.label} dot={s.dot} color={s.color} bg={s.bg} />
              <span style={S.dateText}>{ticket.dateCreation}</span>
            </div>

            {/* Titre */}
            <h3 style={S.ticketTitle}>{ticket.titre}</h3>

            {/* Infos rapides */}
            <div style={S.infoLines}>
              <p style={S.infoLine}>
                <span style={S.infoLbl}>Localisation :</span>
                <strong>{ticket.localisation}</strong>
              </p>
              {users.find((u) => u.id === ticket.auteurId) && (
                <p style={S.infoLine}>
                  <span style={S.infoLbl}>Signalé par :</span>
                  <strong>{users.find((u) => u.id === ticket.auteurId)?.nom}</strong>
                </p>
              )}
              {ticket.description && (
                <p style={{ ...S.infoLine, flexDirection:"column", gap:4 }}>
                  <span style={S.infoLbl}>Description :</span>
                  <span style={{ color:"#374151", lineHeight:1.6 }}>{ticket.description}</span>
                </p>
              )}
            </div>

            {/* Séparateur */}
            <div style={S.divider} />

            {/* Timeline */}
            <div>
              <p style={S.sectionTitle}>📋 Historique</p>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {tl.map((ev, i) => (
                  <div key={i} style={{ display:"flex", gap:12, paddingBottom: i < tl.length-1 ? 16 : 0 }}>
                    {/* Icône + trait */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <span style={S.tlIcon}>{ev.icon}</span>
                      {i < tl.length-1 && <div style={S.tlLine} />}
                    </div>
                    {/* Texte */}
                    <div style={{ paddingTop:1 }}>
                      <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#111827" }}>{ev.titre}</p>
                      <p style={{ margin:"2px 0 0", fontSize:12, color:"#9ca3af" }}>{ev.date}</p>
                      <p style={{ margin:"3px 0 0", fontSize:13, color:"#6b7280" }}>{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {ticket.statut === "resolved" && (
              <>
                <div style={S.divider} />
                <div>
                  <p style={S.sectionTitle}>⭐ Votre feedback</p>
                  {submitted ? (
                    <div style={{ textAlign:"center", padding:"12px 0", color:"#166534", fontWeight:600 }}>
                      ✅ Merci pour votre retour !
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        {[1,2,3,4,5].map((n) => (
                          <button
                            key={n}
                            className="dt-star"
                            onMouseEnter={() => setHovered(n)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(n)}
                            style={{
                              background:"none", border:"none", cursor:"pointer",
                              fontSize:26, padding:2, transition:"transform .15s",
                              color: n <= (hovered || rating) ? "#f59e0b" : "#d1d5db",
                              transform:"scale(1)",
                            }}
                          >★</button>
                        ))}
                        {rating > 0 && (
                          <span style={{ fontSize:12, color:"#9ca3af", marginLeft:4 }}>
                            {["","Insuffisant","Passable","Bien","Très bien","Excellent"][rating]}
                          </span>
                        )}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        placeholder="Commentaire optionnel..."
                        style={S.textarea}
                      />
                      <button
                        className="dt-send"
                        onClick={handleFeedback}
                        disabled={!rating}
                        style={{ ...S.sendBtn, opacity: rating ? 1 : 0.4, cursor: rating ? "pointer" : "not-allowed" }}
                      >
                        Envoyer
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Colonne droite — cartes info */}
          <div style={S.colRight}>

            {/* Card Technicien */}
            <div style={S.infoCard}>
              <p style={S.cardLabel}>TECHNICIEN</p>
              {tech ? (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={S.avatar}>{tech.nom[0]}</span>
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#111827" }}>{tech.nom}</p>
                    <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>{tech.competences?.join(", ")}</p>
                  </div>
                </div>
              ) : (
                <p style={S.cardEmpty}>Aucun technicien assigné</p>
              )}
            </div>

            {/* Card Catégorie / Localisation */}
            <div style={S.infoCard}>
              <p style={S.cardLabel}>LOCALISATION</p>
              <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#111827" }}>{ticket.localisation}</p>
              <p style={{ margin:"4px 0 0", fontSize:12, color:"#9ca3af" }}>{ticket.categorie}</p>
            </div>

            {/* Card Priorité */}
            <div style={S.infoCard}>
              <p style={S.cardLabel}>PRIORITÉ</p>
              <PillBadge label={p.label} dot={p.dot} color={p.color} bg={p.bg} />
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <button style={S.closeFootBtn} onClick={onClose}>Fermer</button>
        </div>

      </div>
    );
  }
}

/* ── Sous-composants ──────────────────────────────────────────────────────── */
function PillBadge({ label, dot, color, bg }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600,
      background: bg, color,
    }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0 }} />
      {label}
    </span>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  overlay: {
    position:"fixed", inset:0,
    background:"rgba(15,23,42,0.55)",
    backdropFilter:"blur(4px)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:1300, padding:16,
    animation:"dt-bg .2s ease",
  },
  box: {
    background:"#fff",
    borderRadius:16,
    width:"100%", maxWidth:860,
    maxHeight:"90vh",
    display:"flex", flexDirection:"column",
    boxShadow:"0 32px 80px rgba(0,0,0,0.22)",
    overflow:"hidden",
    animation:"dt-box .25s ease",
    fontFamily:"'Segoe UI','IBM Plex Sans',sans-serif",
  },

  // Header
  header: {
    background:"#1e3a5f",
    padding:"20px 24px",
    display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12,
    flexShrink:0,
  },
  headerSub:   { margin:"0 0 4px", fontSize:13, color:"#93c5fd", fontWeight:500 },
  headerTitle: { margin:0, fontSize:18, fontWeight:700, color:"#fff" },
  closeBtn: {
    background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%",
    width:34, height:34, cursor:"pointer", fontSize:14, color:"#fff",
    display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0, transition:"background .15s",
  },

  // Corps
  body: {
    display:"grid", gridTemplateColumns:"1fr 240px", gap:0,
    overflowY:"auto", flex:1,
  },
  colLeft: {
    padding:"22px 24px",
    display:"flex", flexDirection:"column", gap:14,
    borderRight:"1px solid #f3f4f6",
  },
  colRight: {
    padding:"22px 20px",
    display:"flex", flexDirection:"column", gap:12,
    background:"#fafafa",
  },

  // Badges
  badgeRow:  { display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" },
  dateText:  { fontSize:13, color:"#9ca3af", marginLeft:4 },

  // Titre ticket
  ticketTitle: { margin:0, fontSize:18, fontWeight:700, color:"#111827", lineHeight:1.3 },

  // Infos
  infoLines: { display:"flex", flexDirection:"column", gap:6 },
  infoLine:  { margin:0, fontSize:14, color:"#6b7280", display:"flex", gap:6, flexWrap:"wrap" },
  infoLbl:   { color:"#9ca3af" },

  divider: { height:1, background:"#f3f4f6", flexShrink:0 },
  sectionTitle: { margin:"0 0 12px", fontSize:13, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.5px" },

  // Timeline
  tlIcon: {
    width:32, height:32, borderRadius:"50%", background:"#f3f4f6",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:14, flexShrink:0,
  },
  tlLine: {
    width:2, flexGrow:1, minHeight:12,
    background:"repeating-linear-gradient(to bottom,#e5e7eb 0,#e5e7eb 4px,transparent 4px,transparent 8px)",
    margin:"3px 0",
  },

  // Cards droite
  infoCard: {
    background:"#fff", borderRadius:10, border:"1.5px solid #e5e7eb",
    padding:"14px 16px",
  },
  cardLabel: { margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px" },
  cardEmpty: { margin:0, fontSize:13, color:"#9ca3af", fontStyle:"italic" },
  avatar: {
    width:36, height:36, borderRadius:"50%", background:"#e0e7ff",
    color:"#3b5bdb", fontWeight:700, fontSize:14,
    display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },

  // Feedback
  textarea: {
    width:"100%", boxSizing:"border-box", padding:"9px 12px",
    borderRadius:8, border:"1.5px solid #e5e7eb",
    fontSize:13, fontFamily:"inherit", color:"#111827",
    resize:"vertical", outline:"none",
  },
  sendBtn: {
    padding:"8px 20px", borderRadius:8, border:"none",
    background:"#1e3a5f", color:"#fff", fontFamily:"inherit",
    fontSize:13, fontWeight:600, transition:"opacity .15s", alignSelf:"flex-start",
  },

  // Footer
  footer: {
    padding:"14px 24px", borderTop:"1px solid #f3f4f6",
    display:"flex", justifyContent:"flex-end", flexShrink:0,
    background:"#fff",
  },
  closeFootBtn: {
    padding:"9px 28px", borderRadius:9, border:"1.5px solid #e5e7eb",
    background:"#fff", color:"#374151", fontFamily:"inherit",
    fontSize:14, fontWeight:600, cursor:"pointer",
  },
};
