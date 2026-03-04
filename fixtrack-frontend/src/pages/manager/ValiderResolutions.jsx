// src/pages/manager/ValiderResolutions.jsx

import { useState, useMemo } from "react";
import { Box, Typography, Paper, Divider, TextField } from "@mui/material";
import Badge from "../../components/common/badge/Badge";
import StarRating from "../../components/common/StarRating";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { tickets, users } from "../../data/mockData";

// ── Icônes SVG inline ─────────────────────────────────────────────────────────
const Icon = {
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  cancel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  person: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  calendar: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  note: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  filter: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  checkBig: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

const PRIORITY_BORDER = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#3B82F6",
  low:      "#D1D5DB",
};

const FILTER_TABS = [
  { key: "all",      label: "Tous"     },
  { key: "critical", label: "Critique" },
  { key: "high",     label: "Haute"    },
  { key: "medium",   label: "Moyenne"  },
  { key: "low",      label: "Basse"    }, // Filtre "Basse" ajouté
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, count, color, bgColor, description }) {
  return (
    <Paper elevation={0} sx={{
      borderRadius: "14px", padding: "20px 22px",
      border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
    }}>
      {/* Cercle décoratif */}
      <Box sx={{ position: "absolute", top: -28, right: -28, width: 90, height: 90, borderRadius: "50%", backgroundColor: bgColor, opacity: 0.7 }} />
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${color}66)` }} />

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "8px" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "36px", fontWeight: 900, color: "#111827", lineHeight: 1, letterSpacing: "-0.04em" }}>
            {count}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: "5px" }}>{description}</Typography>
          )}
        </Box>
        <Box sx={{ width: 42, height: 42, borderRadius: "11px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

// ── Ticket Card ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, onValider, onRejeter }) {
  const technicien = users.find((u) => u.id === ticket.technicienId);
  const [note, setNote] = useState(ticket.noteEmploye || 0);
  const canValider = note > 0;
  const priorityColor = PRIORITY_BORDER[ticket.priorite] || "#E5E7EB";
  const solution = ticket.solutionAppliquee
    || (Array.isArray(ticket.notes) ? ticket.notes[0] : ticket.notes)
    || "Aucune solution renseignée";

  return (
    <Paper elevation={0} sx={{
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
      borderTop: `3px solid ${priorityColor}`,
      backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
    }}>
      <Box sx={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* En-tête */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "14px" }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#111827", mb: "3px", lineHeight: 1.35 }}>
              {ticket.titre}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
              #{ticket.id} · {ticket.localisation}
            </Typography>
          </Box>
          <Badge status={ticket.priorite} />
        </Box>

        <Divider sx={{ borderColor: "#F3F4F6", mb: "14px" }} />

        {/* Technicien + Date */}
        <Box sx={{ display: "flex", gap: "12px", mb: "14px" }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
              {Icon.person}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Résolu par</Typography>
              <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
                {technicien?.nom || "Non assigné"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>
              {Icon.calendar}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Résolu le</Typography>
              <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
                {formatDate(ticket.dateResolution)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Solution appliquée */}
        <Box sx={{ mb: "14px", padding: "10px 12px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid #F3F4F6", flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "5px" }}>
            <Box sx={{ color: "#6B7280" }}>{Icon.note}</Box>
            <Typography sx={{ fontSize: "10px", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Solution appliquée
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>
            {solution}
          </Typography>
        </Box>

        {/* Note */}
        <Box sx={{
          mb: "14px", padding: "10px 14px",
          backgroundColor: canValider ? "#F0FDF4" : "#FFFBEB",
          borderRadius: "8px",
          border: `1px solid ${canValider ? "#BBF7D0" : "#FDE68A"}`,
          transition: "all 0.2s",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: canValider ? "#15803D" : "#92400E" }}>
                {canValider ? "Note attribuée" : "⚠ Note requise"}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: "1px" }}>
                Évaluez la résolution
              </Typography>
            </Box>
            <StarRating initialRating={note} onRate={(val) => setNote(val)} />
          </Box>
          {!canValider && (
            <Typography sx={{ fontSize: "11px", color: "#F59E0B", mt: "6px", fontWeight: 500 }}>
              Attribuez une note avant de valider
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "#F3F4F6", mb: "12px" }} />

        {/* Actions - Boutons plus petits */}
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button
            label="Valider"
            variant="primary"
            onClick={() => onValider(ticket)}
            disabled={!canValider}
            sx={{ 
              py: "6px",
              fontSize: "13px",
              minWidth: "100px"
            }}
          />
          <Button
            label="Rejeter"
            variant="danger"
            onClick={() => onRejeter(ticket)}
            sx={{ 
              py: "6px",
              fontSize: "13px",
              minWidth: "100px"
            }}
          />
        </Box>

      </Box>
    </Paper>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ValiderResolutions() {
  const [ticketsList, setTicketsList] = useState(
    tickets.filter((t) => t.statut === "resolved")
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [raisonRejet, setRaisonRejet] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [closedCount, setClosedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const handleValider = (ticket) => {
    setTicketsList((prev) => prev.filter((t) => t.id !== ticket.id));
    setClosedCount((c) => c + 1);
    showSuccess(`Ticket #${ticket.id} clôturé avec succès `);
  };

  const handleRejeter = (ticket) => {
    setSelectedTicket(ticket);
    setOpenRejectModal(true);
  };

  const confirmRejeter = () => {
    if (!raisonRejet.trim()) return;
    setTicketsList((prev) => prev.filter((t) => t.id !== selectedTicket.id));
    setRejectedCount((c) => c + 1);
    showSuccess(`Ticket #${selectedTicket.id} renvoyé au technicien`);
    setOpenRejectModal(false);
    setSelectedTicket(null);
    setRaisonRejet("");
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filteredTickets = useMemo(() => {
    if (activeFilter === "all") return ticketsList;
    return ticketsList.filter((t) => t.priorite === activeFilter);
  }, [ticketsList, activeFilter]);

  const criticalCount = ticketsList.filter((t) => t.priorite === "critical").length;
  const highCount = ticketsList.filter((t) => t.priorite === "high").length;
  const mediumCount = ticketsList.filter((t) => t.priorite === "medium").length;
  const lowCount = ticketsList.filter((t) => t.priorite === "low").length;

  return (
    <Box sx={{ pb: "80px" }}>

      {/* ── Header épuré sans fond bleu ── */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          sx={{ 
            fontSize: "32px",
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.5px",
            mb: "8px",
            fontFamily: "'Playfair Display', Georgia, serif",
            lineHeight: 1.15,
          }}
        >
          Valider les résolutions
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "16px", color: "#475569" }}>
            Examinez et approuvez les tickets résolus par vos techniciens
          </Typography>
          {ticketsList.length > 0 && (
            <Box sx={{ 
              backgroundColor: "#F1F5F9", 
              borderRadius: "9999px", 
              padding: "4px 12px",
              border: "1px solid #E2E8F0"
            }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
                {ticketsList.length} en attente
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Toast succès ── */}
      {successMsg && (
        <Box sx={{
          mb: "16px", padding: "12px 18px",
          backgroundColor: "#F0FDF4", borderRadius: "10px",
          border: "1px solid #BBF7D0",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Box sx={{ color: "#22C55E", display: "flex", alignItems: "center" }}>{Icon.check}</Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#15803D" }}>{successMsg}</Typography>
          <Box onClick={() => setSuccessMsg("")} sx={{ ml: "auto", cursor: "pointer", color: "#9CA3AF", fontSize: "16px", lineHeight: 1 }}>×</Box>
        </Box>
      )}

      {/* ── KPI Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        <KpiCard icon={Icon.clock}  label="En attente de validation" count={ticketsList.length} color="#F59E0B" bgColor="#FFFBEB" description="Tickets à examiner" />
        <KpiCard icon={Icon.check}  label="Tickets clôturés"          count={closedCount}        color="#22C55E" bgColor="#F0FDF4" description="Validés avec succès" />
        <KpiCard icon={Icon.cancel} label="Tickets rejetés"            count={rejectedCount}      color="#EF4444" bgColor="#FEF2F2" description="Renvoyés au technicien" />
      </Box>

      {/* ── Liste des tickets ── */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>

        {/* Header + filtres */}
        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                Résolutions à valider
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                {activeFilter !== "all" ? " filtrés" : " en attente"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
              {Icon.filter}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Priorité
              </Typography>
            </Box>
          </Box>

          {/* Filter tabs - avec "Basse" ajouté */}
          <Box sx={{ display: "flex", gap: "4px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count =
                tab.key === "all"      ? ticketsList.length :
                tab.key === "critical" ? criticalCount :
                tab.key === "high"     ? highCount :
                tab.key === "medium"   ? mediumCount : lowCount;
              return (
                <Box key={tab.key} onClick={() => setActiveFilter(tab.key)} sx={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "7px 13px", cursor: "pointer",
                  borderRadius: "8px 8px 0 0",
                  borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                  backgroundColor: isActive ? "#F0F7FF" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" },
                }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280" }}>
                    {tab.label}
                  </Typography>
                  <Box sx={{
                    backgroundColor: isActive ? "#2563EB" : "#E5E7EB",
                    color: isActive ? "#FFFFFF" : "#6B7280",
                    borderRadius: "20px", padding: "0 6px",
                    fontSize: "11px", fontWeight: 700, lineHeight: "18px",
                    minWidth: "18px", textAlign: "center",
                  }}>
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Contenu */}
        <Box sx={{ padding: "20px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "60px 24px" }}>
              <Box sx={{ color: "#22C55E", display: "flex", justifyContent: "center", mb: "12px", opacity: 0.7 }}>
                {Icon.checkBig}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#111827", mb: "6px" }}>
                Aucun ticket à valider
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                Tous les tickets résolus ont été traités !
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onValider={handleValider}
                  onRejeter={handleRejeter}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── Modal rejet ── */}
      <Modal
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        title="Rejeter la résolution"
      >
        <Typography sx={{ fontSize: "14px", color: "#6B7280", mb: "16px", lineHeight: 1.6 }}>
          Expliquez pourquoi vous rejetez la résolution du ticket{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>#{selectedTicket?.id}</Box>.
          {" "}Le ticket sera renvoyé au technicien.
        </Typography>

        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          label="Raison du rejet"
          placeholder="Ex: La solution n'a pas résolu le problème complètement..."
          value={raisonRejet}
          onChange={(e) => setRaisonRejet(e.target.value)}
          sx={{
            mb: "16px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "14px",
              "&:hover fieldset": { borderColor: "#2563EB" },
              "&.Mui-focused fieldset": { borderColor: "#2563EB" },
            },
          }}
        />

        <Box sx={{
          mb: "20px", padding: "12px 14px",
          backgroundColor: "#FFFBEB", borderRadius: "8px",
          border: "1px solid #FDE68A",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <Box sx={{ color: "#F59E0B", flexShrink: 0, mt: "1px" }}>{Icon.warning}</Box>
          <Typography sx={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6 }}>
            Le ticket retournera en statut <strong>« En cours »</strong> et le technicien sera notifié.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Button label="Annuler" variant="secondary" onClick={() => setOpenRejectModal(false)} />
          <Button label="Rejeter & Renvoyer" variant="danger" onClick={confirmRejeter} disabled={!raisonRejet.trim()} />
        </Box>
      </Modal>

    </Box>
  );
}