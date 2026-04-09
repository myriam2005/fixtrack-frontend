// src/pages/ticketDetails.jsx
// Feedback : user → peut soumettre (ticket résolu) | autres rôles → lecture seule si feedback existe
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PRIORITY = {
  critical: { label: "Critique",  dot: "#ef4444", color: "#991b1b", bg: "#fef2f2" },
  high:     { label: "Haute",     dot: "#f97316", color: "#9a3412", bg: "#fff7ed" },
  medium:   { label: "Moyenne",   dot: "#eab308", color: "#854d0e", bg: "#fefce8" },
  low:      { label: "Basse",     dot: "#22c55e", color: "#166534", bg: "#f0fdf4" },
};

const STATUS = {
  open:        { label: "Ouvert",   dot: "#3b82f6", color: "#1e40af", bg: "#eff6ff" },
  assigned:    { label: "Assigné",  dot: "#a855f7", color: "#6b21a8", bg: "#faf5ff" },
  in_progress: { label: "En cours", dot: "#f97316", color: "#9a3412", bg: "#fff7ed" },
  resolved:    { label: "Résolu",   dot: "#22c55e", color: "#166534", bg: "#f0fdf4" },
  closed:      { label: "Clôturé",  dot: "#9ca3af", color: "#374151", bg: "#f9fafb" },
};

const FEEDBACK_LABELS = ["", "Insuffisant", "Passable", "Bien", "Très bien", "Excellent"];

function noteIcon(type) {
  if (type === "solution")   return "🔧";
  if (type === "validation") return "✅";
  return "📝";
}
function noteLabel(type) {
  if (type === "solution")   return "Solution ajoutée";
  if (type === "validation") return "Validation";
  return "Note ajoutée";
}

function buildTimeline(ticket) {
  const tech   = ticket.technicienId;
  const auteur = ticket.auteurId;
  const lines  = [];

  lines.push({
    icon: "📋",
    titre: "Ticket créé",
    date: ticket.createdAt || ticket.dateCreation,
    desc: `Signalé par ${auteur?.nom ?? "un employé"}`,
  });
  if (tech)
    lines.push({
      icon: "👤",
      titre: "Technicien assigné",
      date: ticket.createdAt || ticket.dateCreation,
      desc: `Assigné à ${tech.nom ?? tech}`,
    });
  if (["in_progress", "resolved", "closed"].includes(ticket.statut))
    lines.push({
      icon: "🔧",
      titre: "Prise en charge",
      date: ticket.createdAt || ticket.dateCreation,
      desc: "Intervention débutée par le technicien.",
    });

  // ✅ Affiche les notes SAUF les entrées FEEDBACK (évite doublon visuel)
  (ticket.notes ?? []).forEach((note) => {
    if (!note || typeof note !== "object") return;
    const texte = note.texte || note.text || note.contenu || null;
    if (!texte) return;
    if (texte.startsWith("FEEDBACK:")) return; // masqué — affiché dans la section dédiée
    lines.push({
      icon: noteIcon(note.type),
      titre: noteLabel(note.type),
      date: note.date || ticket.createdAt || ticket.dateCreation,
      desc: texte,
    });
  });

  if (ticket.statut === "resolved")
    lines.push({
      icon: "✅",
      titre: "Résolu",
      date: ticket.createdAt || ticket.dateCreation,
      desc: "En attente de votre validation.",
    });
  if (ticket.statut === "closed")
    lines.push({
      icon: "🔒",
      titre: "Clôturé",
      date: ticket.createdAt || ticket.dateCreation,
      desc: "Ticket fermé après validation.",
    });

  return lines;
}

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

export default function DetailTicket({ ticketId: propId, onClose: propClose } = {}) {
  const params   = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const id      = propId ?? params.id;
  const onClose = propClose ?? (() => navigate(-1));

  const [ticket,         setTicket]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [notFound,       setNotFound]       = useState(false);
  const [rating,         setRating]         = useState(0);
  const [hovered,        setHovered]        = useState(0);
  const [comment,        setComment]        = useState("");
  const [submitted,      setSubmitted]      = useState(false);
  const [feedbackErr,    setFeedbackErr]    = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const currentRole = authUser?.role || "user";
  const isUser      = currentRole === "user";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ticketService.getById(id)
      .then((res) => {
        const data = res.data || res;
        const t = { ...data, id: data._id || data.id };
        setTicket(t);
        setNotFound(false);
        if (t.feedback?.rating) {
          setRating(t.feedback.rating);
          setComment(t.feedback.comment || "");
          setSubmitted(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  const handleFeedback = async () => {
    if (!rating || !isUser) return;
    setFeedbackSaving(true);
    setFeedbackErr("");
    try {
      const res = await ticketService.saveFeedback(id, { rating, comment });
      const updated = res.ticket || res.data?.ticket;
      if (updated) setTicket({ ...updated, id: updated._id || updated.id });
      setSubmitted(true);
    } catch (err) {
      setFeedbackErr(err?.response?.data?.message || "Erreur lors de l'envoi du feedback.");
    } finally {
      setFeedbackSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={S.overlay} onClick={handleOverlayClick}>
      {loading  ? renderLoading()  :
       notFound ? renderNotFound() :
       ticket   ? renderModal()    : null}
    </div>
  );

  function renderLoading() {
    return (
      <div style={{ ...S.box, justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Chargement du ticket…</p>
      </div>
    );
  }

  function renderNotFound() {
    return (
      <div style={S.box}>
        <div style={S.header}>
          <div>
            <h2 style={S.headerTitle}>Ticket introuvable</h2>
            <p style={{ margin: 0, color: "#93c5fd", fontSize: 13 }}>ID : {id}</p>
          </div>
          <button style={S.closeBtn} className="dt-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
          Aucun ticket ne correspond à cet identifiant.
        </div>
      </div>
    );
  }

  function renderModal() {
    const p      = PRIORITY[ticket.priorite] ?? PRIORITY.medium;
    const s      = STATUS[ticket.statut]     ?? STATUS.open;
    const tech   = ticket.technicienId && typeof ticket.technicienId === "object" ? ticket.technicienId : null;
    const auteur = ticket.auteurId     && typeof ticket.auteurId     === "object" ? ticket.auteurId     : null;
    const tl     = buildTimeline(ticket);

    const hasFeedback = !!(ticket.feedback?.rating);

    // ✅ Règle d'affichage de la section feedback :
    //   - user + ticket résolu → peut soumettre (ou voir son feedback soumis)
    //   - non-user + feedback existant → lecture seule uniquement
    const showFeedbackSection =
      (isUser && ticket.statut === "resolved") ||
      (!isUser && hasFeedback);

    // ✅ En mode lecture seule (technicien / manager / admin)
    const readOnly = !isUser;

    return (
      <div style={S.box}>
        {/* ── En-tête ── */}
        <div style={S.header}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={S.headerSub}>{ticket.categorie}</p>
            <h2 style={S.headerTitle}>{(ticket.id || "").toString().slice(-8).toUpperCase()} — Détail du ticket</h2>
          </div>
          <button style={S.closeBtn} className="dt-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div style={S.body}>
          {/* ── Colonne gauche ── */}
          <div style={S.colLeft}>
            <div style={S.badgeRow}>
              <PillBadge label={p.label} dot={p.dot} color={p.color} bg={p.bg} />
              <PillBadge label={s.label} dot={s.dot} color={s.color} bg={s.bg} />
              <span style={S.dateText}>{formatDate(ticket.createdAt || ticket.dateCreation)}</span>
            </div>

            <h3 style={S.ticketTitle}>{ticket.titre}</h3>

            <div style={S.infoLines}>
              <p style={S.infoLine}><span style={S.infoLbl}>Localisation :</span><strong>{ticket.localisation}</strong></p>
              {auteur && <p style={S.infoLine}><span style={S.infoLbl}>Signalé par :</span><strong>{auteur.nom}</strong></p>}
              {ticket.description && (
                <p style={{ ...S.infoLine, flexDirection: "column", gap: 4 }}>
                  <span style={S.infoLbl}>Description :</span>
                  <span style={{ color: "#374151", lineHeight: 1.6 }}>{ticket.description}</span>
                </p>
              )}
            </div>

            <div style={S.divider} />

            {/* ── Historique ── */}
            <div>
              <p style={S.sectionTitle}>📋 Historique</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {tl.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < tl.length - 1 ? 16 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={S.tlIcon}>{ev.icon}</span>
                      {i < tl.length - 1 && <div style={S.tlLine} />}
                    </div>
                    <div style={{ paddingTop: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{ev.titre}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{formatDate(ev.date)}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section feedback ── */}
            {showFeedbackSection && (
              <>
                <div style={S.divider} />
                <div>
                  <p style={S.sectionTitle}>⭐ Satisfaction client</p>

                  {/* ── Feedback soumis OU lecture seule (technicien / manager / admin) ── */}
                  {(submitted || (readOnly && hasFeedback)) ? (
                    <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 15, color: "#16a34a", fontWeight: 700 }}>
                          {isUser ? "✅ Votre feedback" : "💬 Feedback de l'utilisateur"}
                        </span>
                        {readOnly && (
                          <span style={{ fontSize: 11, color: "#6b7280", background: "#e5e7eb", borderRadius: 6, padding: "2px 8px" }}>
                            Lecture seule
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} style={{ fontSize: 22, color: n <= (ticket.feedback?.rating || rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
                        ))}
                        <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 8, alignSelf: "center" }}>
                          {FEEDBACK_LABELS[ticket.feedback?.rating || rating]}
                        </span>
                      </div>
                      {(ticket.feedback?.comment || comment) && (
                        <p style={{ margin: 0, fontSize: 13, color: "#374151", fontStyle: "italic" }}>
                          "{ticket.feedback?.comment || comment}"
                        </p>
                      )}
                      {ticket.feedback?.date && (
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
                          Soumis le {formatDate(ticket.feedback.date)}
                        </p>
                      )}
                    </div>

                  ) : (
                    /* ── Formulaire — user uniquement, pas encore soumis ── */
                    isUser && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {feedbackErr && (
                          <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
                            {feedbackErr}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              className="dt-star"
                              onMouseEnter={() => setHovered(n)}
                              onMouseLeave={() => setHovered(0)}
                              onClick={() => setRating(n)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, padding: 2, transition: "transform .15s", color: n <= (hovered || rating) ? "#f59e0b" : "#d1d5db", transform: "scale(1)" }}>
                              ★
                            </button>
                          ))}
                          {rating > 0 && (
                            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>{FEEDBACK_LABELS[rating]}</span>
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
                          disabled={!rating || feedbackSaving}
                          style={{ ...S.sendBtn, opacity: (!rating || feedbackSaving) ? 0.4 : 1, cursor: (!rating || feedbackSaving) ? "not-allowed" : "pointer" }}>
                          {feedbackSaving ? "Envoi…" : "Envoyer mon feedback"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Colonne droite ── */}
          <div style={S.colRight}>
            <div style={S.infoCard}>
              <p style={S.cardLabel}>TECHNICIEN</p>
              {tech ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={S.avatar}>{tech.nom?.[0] ?? "T"}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>{tech.nom}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{tech.competences?.join(", ")}</p>
                  </div>
                </div>
              ) : (
                <p style={S.cardEmpty}>Aucun technicien assigné</p>
              )}
            </div>

            <div style={S.infoCard}>
              <p style={S.cardLabel}>LOCALISATION</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>{ticket.localisation}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>{ticket.categorie}</p>
            </div>

            <div style={S.infoCard}>
              <p style={S.cardLabel}>PRIORITÉ</p>
              <PillBadge label={p.label} dot={p.dot} color={p.color} bg={p.bg} />
            </div>

            {/* ✅ Résumé satisfaction dans colonne droite si feedback existant */}
            {hasFeedback && (
              <div style={S.infoCard}>
                <p style={S.cardLabel}>SATISFACTION</p>
                <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} style={{ fontSize: 16, color: n <= ticket.feedback.rating ? "#f59e0b" : "#d1d5db" }}>★</span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{FEEDBACK_LABELS[ticket.feedback.rating]}</p>
              </div>
            )}
          </div>
        </div>

        <div style={S.footer}>
          <button style={S.closeFootBtn} onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }
}

function PillBadge({ label, dot, color, bg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: bg, color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const S = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: 16, animation: "dt-bg .2s ease" },
  box:          { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.22)", overflow: "hidden", animation: "dt-box .25s ease", fontFamily: "'Segoe UI','IBM Plex Sans',sans-serif" },
  header:       { background: "#1e3a5f", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexShrink: 0 },
  headerSub:    { margin: "0 0 4px", fontSize: 13, color: "#93c5fd", fontWeight: 500 },
  headerTitle:  { margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" },
  closeBtn:     { background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" },
  body:         { display: "grid", gridTemplateColumns: "1fr 240px", gap: 0, overflowY: "auto", flex: 1 },
  colLeft:      { padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14, borderRight: "1px solid #f3f4f6" },
  colRight:     { padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12, background: "#fafafa" },
  badgeRow:     { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  dateText:     { fontSize: 13, color: "#9ca3af", marginLeft: 4 },
  ticketTitle:  { margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.3 },
  infoLines:    { display: "flex", flexDirection: "column", gap: 6 },
  infoLine:     { margin: 0, fontSize: 14, color: "#6b7280", display: "flex", gap: 6, flexWrap: "wrap" },
  infoLbl:      { color: "#9ca3af" },
  divider:      { height: 1, background: "#f3f4f6", flexShrink: 0 },
  sectionTitle: { margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" },
  tlIcon:       { width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  tlLine:       { width: 2, flexGrow: 1, minHeight: 12, background: "repeating-linear-gradient(to bottom,#e5e7eb 0,#e5e7eb 4px,transparent 4px,transparent 8px)", margin: "3px 0" },
  infoCard:     { background: "#fff", borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "14px 16px" },
  cardLabel:    { margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px" },
  cardEmpty:    { margin: 0, fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
  avatar:       { width: 36, height: 36, borderRadius: "50%", background: "#e0e7ff", color: "#3b5bdb", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  textarea:     { width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit", color: "#111827", resize: "vertical", outline: "none" },
  sendBtn:      { padding: "8px 20px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "opacity .15s", alignSelf: "flex-start" },
  footer:       { padding: "14px 24px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", flexShrink: 0, background: "#fff" },
  closeFootBtn: { padding: "9px 28px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};