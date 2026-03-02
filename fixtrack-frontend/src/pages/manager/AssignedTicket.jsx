// src/pages/manager/AssignerTicket.jsx
import { useState } from "react";
import { Button as MuiButton } from "@mui/material";
import { tickets as initialTickets, users, notifications } from "../../data/mockData";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import styles from "../employee/MyTickets.module.css";

// ─── Tokens (alignés sur Badge.jsx) ──────────────────────────────────────────
const TOKENS = {
  open:        { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  assigned:    { dot: "#6366F1", bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  in_progress: { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  critical:    { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  high:        { dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  medium:      { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  low:         { dot: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
};

const LABELS = {
  open:        "Ouvert",
  assigned:    "Assigné",
  in_progress: "En cours",
  critical:    "Critique",
  high:        "Haute",
  medium:      "Moyenne",
  low:         "Basse",
};

const STATUT_KEYS   = ["open", "assigned", "in_progress"];
const PRIORITE_KEYS = ["critical", "high", "medium", "low"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const techniciens = users.filter((u) => u.role === "technician");

const AVATAR_COLORS = {
  u1: "#16a34a", u2: "#0d9488", u3: "#dc2626", u4: "#d97706", u5: "#7c3aed",
};

const chargeOf = (techId, ticketsList) =>
  ticketsList.filter(
    (t) => t.technicienId === techId && ["assigned", "in_progress"].includes(t.statut)
  ).length;

// ─── Modal overlay animation (minimal, not in CSS module) ────────────────────
if (typeof document !== "undefined" && !document.getElementById("at-modal-styles")) {
  const s = document.createElement("style");
  s.id = "at-modal-styles";
  s.textContent = `
    @keyframes at-fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes at-slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes at-toast   { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    .at-tc { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:12px; cursor:pointer; transition:all .15s; position:relative; }
    .at-tc:hover { border-color:#bfdbfe !important; background:#f0f7ff !important; }
  `;
  document.head.appendChild(s);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssignerTicket() {
  const [tickets, setTickets]    = useState([...initialTickets]);
  const [search,  setSearch]     = useState("");
  const [statuts,    setStatuts]    = useState([]);
  const [priorites,  setPriorites]  = useState([]);
  const [modal,      setModal]      = useState(null);
  const [selectedTech, setSel]      = useState(null);
  const [toast,      setToast]      = useState(null);

  const toggle = (arr, setArr, key) =>
    setArr(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  const clearAll = () => { setStatuts([]); setPriorites([]); setSearch(""); };

  const activeTags = [
    ...statuts.map((k) => ({
      key: `s-${k}`, label: LABELS[k],
      remove: () => setStatuts((p) => p.filter((x) => x !== k)),
    })),
    ...priorites.map((k) => ({
      key: `p-${k}`, label: LABELS[k],
      remove: () => setPriorites((p) => p.filter((x) => x !== k)),
    })),
  ];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const confirmer = () => {
    if (!selectedTech || !modal) return;
    const tech = techniciens.find((t) => t.id === selectedTech);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === modal.id ? { ...t, technicienId: selectedTech, statut: "assigned" } : t
      )
    );
    notifications.push({
      id: `n${Date.now()}`, userId: selectedTech,
      message: `Nouveau ticket assigné : ${modal.titre}`,
      type: "ticket_assigned", lu: false, ticketId: modal.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setModal(null); setSel(null);
    showToast(`Ticket assigné à ${tech.nom}`);
  };

  const visible = tickets.filter((t) => {
    const inBase     = ["open", "assigned", "in_progress"].includes(t.statut);
    const inStatut   = statuts.length   === 0 || statuts.includes(t.statut);
    const inPriorite = priorites.length === 0 || priorites.includes(t.priorite);
    const inSearch   = search === "" ||
      t.titre.toLowerCase().includes(search.toLowerCase()) ||
      t.categorie.toLowerCase().includes(search.toLowerCase()) ||
      t.localisation.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return inBase && inStatut && inPriorite && inSearch;
  });

  const techOf = (ticket) =>
    ticket.technicienId ? users.find((u) => u.id === ticket.technicienId) : null;

  return (
    <div className={styles.root}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.pageEyebrow}>Manager · Assignation</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className={styles.pageTitle}>Assignation des tickets</h1>
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 10px", borderRadius: 20,
              background: "#F1F5F9", color: "#64748B",
              fontSize: 13, fontWeight: 500,
            }}>
              {tickets.filter((t) => ["open","assigned","in_progress"].includes(t.statut)).length} ticket(s) total
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            {tickets.filter((t) => t.statut === "assigned").length} assignés en ce moment
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🎫" label="Tous les tickets" sub="Total créés"       value={tickets.length}                                         color="#111827" iconBg="#F0F4FF" />
        <StatCard icon="📬" label="Ouverts"          sub="En attente"        value={tickets.filter((t) => t.statut === "open").length}       color="#1D4ED8" iconBg="#EFF6FF" />
        <StatCard icon="🔄" label="Assignés"         sub="Pris en charge"    value={tickets.filter((t) => t.statut === "assigned").length}   color="#4338CA" iconBg="#EEF2FF" />
        <StatCard icon="🔴" label="Critiques"        sub="Priorité critique" value={tickets.filter((t) => t.priorite === "critical").length} color="#B91C1C" iconBg="#FEF2F2" />
      </div>

      {/* ── Filter Panel ── */}
      <div className={styles.filterPanel}>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher par titre, ID, catégorie, localisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Chips */}
        <div className={styles.filterGroups}>

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupLabel}>📋 Statut</div>
            <div className={styles.filterChips}>
              {STATUT_KEYS.map((k) => (
                <button
                  key={k}
                  className={`${styles.chip}${statuts.includes(k) ? ` ${styles.active}` : ""}`}
                  style={{ "--chip-color": TOKENS[k]?.dot, "--chip-bg": TOKENS[k]?.bg }}
                  onClick={() => toggle(statuts, setStatuts, k)}
                >
                  {LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupLabel}>⚠️ Priorité</div>
            <div className={styles.filterChips}>
              {PRIORITE_KEYS.map((k) => (
                <button
                  key={k}
                  className={`${styles.chip}${priorites.includes(k) ? ` ${styles.active}` : ""}`}
                  style={{ "--chip-color": TOKENS[k]?.dot, "--chip-bg": TOKENS[k]?.bg }}
                  onClick={() => toggle(priorites, setPriorites, k)}
                >
                  <span
                    className={`${styles.chipDot}${k === "critical" ? ` ${styles.pulseDot}` : ""}`}
                    style={{ background: TOKENS[k]?.dot }}
                  />
                  {LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#64748B", alignSelf: "center", whiteSpace: "nowrap" }}>
            <strong style={{ color: "#0F172A" }}>{visible.length}</strong> ticket{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Active tags */}
        {activeTags.length > 0 && (
          <div className={styles.activeSummary}>
            <span className={styles.activeLabel}>Filtres actifs :</span>
            {activeTags.map((t) => (
              <span key={t.key} className={styles.activeTag}>
                {t.label}
                <button className={styles.activeTagRemove} onClick={t.remove}>✕</button>
              </span>
            ))}
            <button className={styles.clearAll} onClick={clearAll}>Tout effacer</button>
          </div>
        )}
      </div>

      {/* ── Results bar ── */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsText}>
          <strong>{visible.length}</strong> ticket{visible.length !== 1 ? "s" : ""} affichés
        </span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {["ID", "Titre", "Catégorie", "Priorité", "Statut", "Localisation", "Technicien", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket, i) => {
              const tech = techOf(ticket);
              return (
                <tr key={ticket.id} style={{ animationDelay: `${i * 40}ms` }}>
                  <td>
                    <div className={styles.ticketId} style={{ color: "#64748B", fontWeight: 600 }}>{ticket.id}</div>
                  </td>
                  <td>
                    <div className={styles.ticketTitle}>{ticket.titre}</div>
                    <div className={styles.ticketLoc}>📍 {ticket.localisation}</div>
                  </td>
                  <td>
                    <span className={styles.catBadge}>{ticket.categorie}</span>
                  </td>
                  <td><Badge status={ticket.priorite} /></td>
                  <td><Badge status={ticket.statut} /></td>
                  <td>
                    <span className={styles.date}>{ticket.dateCreation}</span>
                  </td>
                  <td>
                    {tech ? (
                      <div className={styles.techWrap}>
                        <div className={styles.avatar} style={{ background: AVATAR_COLORS[tech.id] }}>
                          {tech.nom[0].toUpperCase()}
                        </div>
                        <span className={styles.techName}>{tech.nom}</span>
                      </div>
                    ) : (
                      <span className={styles.unassigned}>—</span>
                    )}
                  </td>
                  <td>
                    <MuiButton
                      variant="contained"
                      size="small"
                      onClick={() => { setModal(ticket); setSel(ticket.technicienId); }}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "12.5px",
                        padding: "5px 16px",
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      {ticket.technicienId ? "Réassigner" : "Assigner"}
                    </MuiButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>Aucun ticket trouvé</div>
            <div className={styles.emptySub}>Modifiez vos filtres pour afficher des résultats.</div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          onClick={(e) => e.target === e.currentTarget && (setModal(null), setSel(null))}
          style={{
            position: "fixed", inset: 0, background: "rgba(10,12,30,0.5)",
            backdropFilter: "blur(5px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1200, animation: "at-fadeIn .15s ease",
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20, width: 560, maxWidth: "95vw",
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            boxShadow: "0 30px 90px rgba(0,0,0,0.2)", overflow: "hidden",
            animation: "at-slideUp .22s ease", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>

            {/* Modal Header */}
            <div style={{ padding: "24px 28px 20px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Assignation</p>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0F172A" }}>Choisir un technicien</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#64748B", fontWeight: 600 }}>{modal.id}</span>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{modal.titre}</span>
                  <Badge status={modal.priorite} />
                </div>
              </div>
              <Button label="✕" variant="secondary" onClick={() => { setModal(null); setSel(null); }} />
            </div>

            {/* Tech List */}
            <div style={{ overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
              {techniciens.map((tech) => {
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
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={styles.avatar} style={{ width: 44, height: 44, fontSize: 15, background: isSel ? "#2563EB" : AVATAR_COLORS[tech.id] }}>
                        {tech.nom[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{tech.nom}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                          {tech.competences?.join(", ") ?? "Maintenance"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 800, fontSize: 22, color: charge > 3 ? "#D97706" : "#0F172A", lineHeight: 1 }}>{charge}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.4px" }}>en cours</div>
                      </div>
                      <span
                        title={dispo ? "Disponible" : "Surchargé"}
                        style={{
                          width: 13, height: 13, borderRadius: "50%", display: "inline-block",
                          background:  dispo ? "#22C55E" : "#EF4444",
                          boxShadow:   dispo ? "0 0 0 3px #DCFCE7" : "0 0 0 3px #FEE2E2",
                        }}
                      />
                    </div>
                    {isSel && (
                      <div style={{ position: "absolute", top: 10, right: 14, width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px 24px", borderTop: "1.5px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
          background: "#0F172A", color: "#fff", padding: "14px 26px", borderRadius: 12,
          fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
          zIndex: 2000, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          animation: "at-toast .25s ease", whiteSpace: "nowrap",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, sub, value, color, iconBg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16,
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{ padding: "20px 22px 16px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px" }}>
            {label}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: hovered ? color + "22" : (iconBg || "#F0F4FF"),
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            transition: "background 0.2s ease",
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#0F172A", lineHeight: 1, marginBottom: 8 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>{sub}</div>
      </div>
      <div style={{ height: 4, background: color || "#E2E8F0", transition: "height 0.2s ease", ...(hovered ? { height: 6 } : {}) }} />
    </div>
  );
}
