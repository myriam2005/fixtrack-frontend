// src/pages/manager/AssignerTicket.jsx
import { useState } from "react";
import { Button as MuiButton, Box, Divider } from "@mui/material";
import { tickets as initialTickets, users, notifications } from "../../data/mockData";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import styles from "../employee/MyTickets.module.css";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const TOKENS = {
  open:        { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  assigned:    { dot: "#6366F1", bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  in_progress: { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  resolved:    { dot: "#22C55E", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  closed:      { dot: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
  critical:    { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  high:        { dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  medium:      { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  low:         { dot: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
};

const LABELS = {
  open:        "Ouvert",
  assigned:    "Assigné",
  in_progress: "En cours",
  resolved:    "Résolu",
  closed:      "Clôturé",
  critical:    "Critique",
  high:        "Haute",
  medium:      "Moyenne",
  low:         "Basse",
};

const PRIORITY_LEFT_COLOR = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#9CA3AF",
};

const STATUS_STEPS = ["open", "assigned", "in_progress", "resolved"];

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
    @keyframes at-slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes at-toast   { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    .at-tc { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:12px; cursor:pointer; transition:all .15s; position:relative; }
    .at-tc:hover { border-color:#bfdbfe !important; background:#f0f7ff !important; }
  `;
  document.head.appendChild(s);
}

// ─── StatusDots ───────────────────────────────────────────────────────────────
function StatusDots({ statut }) {
  const stepIndex = STATUS_STEPS.indexOf(statut);
  const dotColor  = TOKENS[statut]?.dot || "#9CA3AF";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            width: i === stepIndex ? 10 : 8,
            height: i === stepIndex ? 10 : 8,
            borderRadius: "50%",
            background: i <= stepIndex ? dotColor : "#E2E8F0",
            flexShrink: 0,
          }} />
          {i < 2 && (
            <div style={{
              width: 20, height: 2,
              background: i < stepIndex ? dotColor : "#E2E8F0",
              borderRadius: 2, flexShrink: 0,
            }} />
          )}
        </div>
      ))}
      <span style={{ fontSize: 11.5, color: dotColor, fontWeight: 600, marginLeft: 6 }}>
        {LABELS[statut]}
      </span>
    </div>
  );
}

// ─── TicketRow — hover identique à TechnicianDashboard ───────────────────────
function TicketRow({ ticket, tech, isLast, onAssign }) {
  const [hovered, setHovered] = useState(false);
  const leftColor = PRIORITY_LEFT_COLOR[ticket.priorite] || "#E2E8F0";

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "13px 18px 13px 16px",
          borderLeft: `3px solid ${leftColor}`,
          borderRadius: "0 10px 10px 0",
          backgroundColor: "transparent",
          transition: "background 0.15s, padding-left 0.15s",
          "&:hover": { backgroundColor: "#F8FAFF", paddingLeft: "20px" },
        }}
      >
        {/* Dot priorité */}
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: leftColor,
          boxShadow: `0 0 0 3px ${leftColor}22`,
        }} />

        {/* ID */}
        <Box sx={{ minWidth: 36, flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#94A3B8", fontWeight: 600 }}>
            {ticket.id}
          </span>
        </Box>

        {/* Titre + localisation + dots */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260, marginBottom: 2 }}>
            {ticket.titre}
          </div>
          <div style={{ fontSize: 11.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}>
            📍 {ticket.localisation}
          </div>
          <StatusDots statut={ticket.statut} />
        </Box>

        {/* Catégorie */}
        <Box sx={{ flexShrink: 0 }}>
          <span className={styles.catBadge}>{ticket.categorie}</span>
        </Box>

        {/* Priorité */}
        <Box sx={{ flexShrink: 0 }}><Badge status={ticket.priorite} /></Box>

        {/* Statut */}
        <Box sx={{ flexShrink: 0 }}><Badge status={ticket.statut} /></Box>

        {/* Date */}
        <Box sx={{ flexShrink: 0 }}>
          <span className={styles.date}>{ticket.dateCreation}</span>
        </Box>

        {/* Technicien */}
        <Box sx={{ flexShrink: 0, minWidth: 130 }}>
          {tech ? (
            <div className={styles.techWrap}>
              <div className={styles.avatar} style={{ background: AVATAR_COLORS[tech.id] || "#6366F1" }}>
                {tech.nom[0].toUpperCase()}
              </div>
              <span className={styles.techName}>{tech.nom}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>—</span>
          )}
        </Box>

        {/* Actions — toujours visibles */}
        <Box sx={{ flexShrink: 0 }}>
          <MuiButton
            variant="contained"
            size="small"
            onClick={() => onAssign(ticket)}
            sx={{
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12.5px",
              padding: "6px 18px",
              boxShadow: "none",
              whiteSpace: "nowrap",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {ticket.technicienId ? "Réassigner" : "Assigner"}
          </MuiButton>
        </Box>
      </Box>

      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssignerTicket() {
  const [tickets, setTickets]     = useState([...initialTickets]);
  const [search,  setSearch]      = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [modal,     setModal]     = useState(null);
  const [selectedTech, setSel]    = useState(null);
  const [toast,     setToast]     = useState(null);

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

  const tabCounts = {
    all:         tickets.length,
    open:        tickets.filter((t) => t.statut === "open").length,
    assigned:    tickets.filter((t) => t.statut === "assigned").length,
    in_progress: tickets.filter((t) => t.statut === "in_progress").length,
    resolved:    tickets.filter((t) => t.statut === "resolved").length,
    closed:      tickets.filter((t) => t.statut === "closed").length,
  };

  const visible = tickets.filter((t) => {
    const inTab = activeTab === "all" || t.statut === activeTab;
    const inSearch = search === "" ||
      t.titre.toLowerCase().includes(search.toLowerCase()) ||
      t.categorie.toLowerCase().includes(search.toLowerCase()) ||
      t.localisation.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return inTab && inSearch;
  });

  const techOf = (ticket) => ticket.technicienId ? users.find((u) => u.id === ticket.technicienId) : null;

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
          <h1 className={styles.pageTitle}>Assignation des tickets</h1>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>

        {/* ── Top Bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
              Liste des tickets
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94A3B8" }}>
              {visible.length} ticket{visible.length !== 1 ? "s" : ""} affichés · Survolez une ligne pour les actions
            </p>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: 10, padding: "8px 14px", width: 290,
          }}>
            <span style={{ fontSize: 14, color: "#94A3B8", flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un ticket, employé, lieu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: "#0F172A", width: "100%",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 13, padding: 0 }}>✕</button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", padding: "0 24px",
          borderBottom: "1px solid #F1F5F9",
          overflowX: "auto", gap: 0,
        }}>
          {TABS.map((tab) => {
            const count = tabCounts[tab.key];
            if (count === 0 && tab.key !== "all") return null;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "12px 14px",
                  border: "none", background: "transparent", cursor: "pointer",
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2563EB" : "#64748B",
                  borderBottom: isActive ? "2.5px solid #2563EB" : "2.5px solid transparent",
                  marginBottom: -1, whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
                <span style={{
                  background: isActive ? "#2563EB" : "#E2E8F0",
                  color: isActive ? "#fff" : "#64748B",
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 7px", borderRadius: 99,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Rows ── */}
        <Box sx={{ padding: "8px 6px 12px" }}>
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
                      <span style={{
                        width: 13, height: 13, borderRadius: "50%", display: "inline-block",
                        background: dispo ? "#22C55E" : "#EF4444",
                        boxShadow: dispo ? "0 0 0 3px #DCFCE7" : "0 0 0 3px #FEE2E2",
                      }} />
                    </div>
                    {isSel && (
                      <div style={{ position: "absolute", top: 10, right: 14, width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>

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
