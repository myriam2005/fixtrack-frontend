// src/pages/admin/TousTickets.jsx
// ─── Page principale — logique métier, filtres, liste ─────────────────────────
//  Composants UI (modales, avatar, tracker) importés depuis TicketModals.jsx

import { useMemo, useState } from "react";
import { Box, Typography, Paper, Divider, TextField, Tooltip } from "@mui/material";
import Badge from "../../../components/common/Badge";
import { tickets, users } from "../../../data/mockData";
import { DashboardIcon } from "../../components/common/DashboardShared";
import { formatDate } from "../../components/common/DashboardSharedUtils";
import {
  EditModal, DeleteModal,
  StatusTracker, UserAvatar,
  STATUS_CONFIG, PRIORITY_BORDER,
} from "./TicketsModal";

// ── Config filtres ─────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "open",        label: "Ouverts"  },
  { key: "assigned",    label: "Assignés" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
  { key: "closed",      label: "Clôturés" },
];

// ── Icônes SVG locales ─────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const WrenchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ── TicketRow ──────────────────────────────────────────────────────────────────

function TicketRow({ ticket, employee, technician, isLast, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "13px 16px",
          borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
          borderRadius: "0 10px 10px 0",
          backgroundColor: hovered ? "#F8FAFF" : "transparent",
          transition: "background 0.15s",
        }}
      >
        {/* Dot priorité */}
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB",
          boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22`,
        }} />

        {/* Infos principales */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "3px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "4px", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#9CA3AF" }}>
              {DashboardIcon.calendar}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(ticket.dateCreation)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#9CA3AF" }}>
              {DashboardIcon.pin}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ticket.localisation}
              </Typography>
            </Box>
          </Box>
          <StatusTracker statut={ticket.statut} />
        </Box>

        {/* Employé */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 90, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box sx={{ color: "#9CA3AF", display: "flex", alignItems: "center" }}><UserIcon /></Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Créé par</Typography>
          </Box>
          {employee ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserAvatar name={employee.nom} color="#2563EB" size={24} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                {employee.nom.split(" ")[0]}
              </Typography>
            </Box>
          ) : <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>—</Typography>}
        </Box>

        {/* Technicien */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 100, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box sx={{ color: "#9CA3AF", display: "flex", alignItems: "center" }}><WrenchIcon /></Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Technicien</Typography>
          </Box>
          {technician ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserAvatar name={technician.nom} color="#8B5CF6" size={24} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                {technician.nom.split(" ")[0]}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "20px", padding: "3px 10px" }}>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic" }}>Non assigné</Typography>
            </Box>
          )}
        </Box>

        {/* Badge statut */}
        <Box sx={{ flexShrink: 0, minWidth: 72 }}>
          <Badge status={ticket.statut} />
        </Box>

        {/* Actions — visibles au survol */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity 0.15s", pointerEvents: hovered ? "auto" : "none" }}>
          <Tooltip title="Modifier" arrow placement="top">
            <Box component="button" onClick={e => { e.stopPropagation(); onEdit(ticket); }} sx={{
              width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB",
              backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", transition: "all 0.15s",
              "&:hover": { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", color: "#2563EB" },
            }}>
              <EditIcon />
            </Box>
          </Tooltip>

          <Tooltip title="Supprimer" arrow placement="top">
            <Box component="button" onClick={e => { e.stopPropagation(); onDelete(ticket); }} sx={{
              width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB",
              backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", transition: "all 0.15s",
              "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#EF4444" },
            }}>
              <TrashIcon />
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function Tickets() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [localTickets, setLocalTickets] = useState(tickets);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const enrichedTickets = useMemo(() => localTickets.map(t => ({
    ...t,
    employee:   users.find(u => u.id === t.auteurId)     || null,
    technician: users.find(u => u.id === t.technicienId) || null,
  })), [localTickets]);

  const counts = useMemo(() => ({
    all:         enrichedTickets.length,
    open:        enrichedTickets.filter(t => t.statut === "open").length,
    assigned:    enrichedTickets.filter(t => t.statut === "assigned").length,
    in_progress: enrichedTickets.filter(t => t.statut === "in_progress").length,
    resolved:    enrichedTickets.filter(t => t.statut === "resolved").length,
    closed:      enrichedTickets.filter(t => t.statut === "closed").length,
  }), [enrichedTickets]);

  const filteredTickets = useMemo(() => {
    let result = [...enrichedTickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    if (activeFilter !== "all") result = result.filter(t => t.statut === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.titre.toLowerCase().includes(q) ||
        t.localisation.toLowerCase().includes(q) ||
        t.categorie?.toLowerCase().includes(q) ||
        t.employee?.nom.toLowerCase().includes(q) ||
        t.technician?.nom.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrichedTickets, activeFilter, search]);

  const handleSave = updated => {
    setLocalTickets(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
    setEditTarget(null);
    showToast("Ticket mis à jour avec succès.", "success");
  };

  const handleDelete = () => {
    setLocalTickets(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("Ticket supprimé définitivement.", "delete");
  };

  return (
    <Box sx={{ pb: "80px", position: "relative" }}>

      {/* ── Toast ── */}
      {toast && (
        <Box sx={{
          position: "fixed", bottom: 28, right: 28, zIndex: 2000,
          display: "flex", alignItems: "center", gap: "10px",
          backgroundColor: "#111827", color: "#FFFFFF",
          borderRadius: "12px", padding: "12px 18px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
          animation: "fadeUp 0.22s ease",
          "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: toast.type === "delete" ? "#EF4444" : "#22C55E", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>{toast.message}</Typography>
        </Box>
      )}

      {/* ── En-tête ── */}
      <Box sx={{ mb: "28px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "10px" }}>
          <Box sx={{ width: 28, height: 2, backgroundColor: "#2563EB", borderRadius: 1 }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Administration
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15, letterSpacing: "-0.3px", mb: "6px" }}>
          Tous les tickets
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
          Vue globale de l'ensemble des tickets de la plateforme
        </Typography>
      </Box>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>

        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px", gap: "12px" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Liste des tickets</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}{search ? " trouvés" : " affichés"} · Survolez une ligne pour les actions
              </Typography>
            </Box>
            <TextField
              size="small" placeholder="Rechercher un ticket, employé, lieu…"
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Box sx={{ color: "#9CA3AF", display: "flex", alignItems: "center", mr: "4px" }}><SearchIcon /></Box> }}
              sx={{
                minWidth: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px", fontSize: "13px", backgroundColor: "#F9FAFB",
                  "& fieldset": { borderColor: "#E5E7EB" },
                  "&:hover fieldset": { borderColor: "#D1D5DB" },
                  "&.Mui-focused fieldset": { borderColor: "#2563EB" },
                },
              }}
            />
          </Box>

          {/* Tabs filtres */}
          <Box sx={{ display: "flex", gap: "4px", overflowX: "auto" }}>
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab.key;
              const count = counts[tab.key] ?? 0;
              return (
                <Box key={tab.key} onClick={() => setActiveFilter(tab.key)} sx={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "7px 13px",
                  cursor: "pointer", flexShrink: 0, borderRadius: "8px 8px 0 0",
                  borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
                  backgroundColor: isActive ? "#F0F7FF" : "transparent", transition: "all 0.15s",
                  "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" },
                }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280" }}>
                    {tab.label}
                  </Typography>
                  <Box sx={{ backgroundColor: isActive ? "#2563EB" : "#E5E7EB", color: isActive ? "#FFFFFF" : "#6B7280", borderRadius: "20px", padding: "0 6px", fontSize: "11px", fontWeight: 700, lineHeight: "18px", minWidth: "18px", textAlign: "center" }}>
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Rows */}
        <Box sx={{ padding: "8px 6px 12px" }}>
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "48px 24px" }}>
              <Box sx={{ fontSize: "36px", mb: "12px" }}>🔍</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>Aucun ticket trouvé</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Essayez de modifier les filtres ou le terme de recherche</Typography>
            </Box>
          ) : (
            filteredTickets.map((ticket, index) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                employee={ticket.employee}
                technician={ticket.technician}
                isLast={index === filteredTickets.length - 1}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </Box>
      </Paper>

      {/* ── Modales ── */}
      {editTarget   && <EditModal   ticket={editTarget}   onClose={() => setEditTarget(null)}   onSave={handleSave}   />}
      {deleteTarget && <DeleteModal ticket={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </Box>
  );
}