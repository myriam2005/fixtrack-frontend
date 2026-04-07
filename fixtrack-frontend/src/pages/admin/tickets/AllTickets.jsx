// src/pages/admin/tickets/AllTickets.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { Box, Typography, Paper, Divider, TextField, Tooltip } from "@mui/material";
import Badge from "../../../components/common/badge/Badge";
import SkeletonLoader from "../../../components/common/SkeletonLoader";
import { ticketService, userService } from "../../../services/api";
import { formatDate } from "../../../components/common/dashboard/DashboardSharedUtils";
import { EditModal, DeleteModal, StatusTracker, UserAvatar } from "./TicketsModal";
import { PRIORITY_BORDER } from "./TicketsModalConstants";
import { DashboardIcon } from "../../../components/common/dashboard/DashboardIconConstants";

const FILTER_TABS = [
  { key: "all",         label: "Tous"     },
  { key: "open",        label: "Ouverts"  },
  { key: "assigned",    label: "Assignés" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved",    label: "Résolus"  },
  { key: "closed",      label: "Clôturés" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Extrait la vraie date de création depuis n'importe quel ticket brut.
// Ordre de priorité :
//   1. createdAt       → champ réel MongoDB (timestamps:true)
//   2. dateCreation    → virtual Mongoose (présent si toJSON:{virtuals:true})
//   3. _id timestamp   → l'ObjectId MongoDB encode la date de création !
//      C'est le fallback ultime — fonctionne TOUJOURS même sans populate
// ─────────────────────────────────────────────────────────────────────────────
function extractCreatedAt(ticket) {
  // 1. createdAt réel
  if (ticket.createdAt) {
    const d = new Date(ticket.createdAt);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // 2. virtual dateCreation
  if (ticket.dateCreation) {
    const d = new Date(ticket.dateCreation);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // 3. Fallback : extraire la date depuis l'ObjectId MongoDB
  // Les 4 premiers octets de l'_id encodent le timestamp Unix en secondes
  const rawId = ticket._id || ticket.id || "";
  if (rawId && typeof rawId === "string" && rawId.length >= 8) {
    try {
      const timestamp = parseInt(rawId.substring(0, 8), 16) * 1000;
      const d = new Date(timestamp);
      if (!isNaN(d.getTime()) && d.getFullYear() > 2000) return d.toISOString();
    } catch { /* ignore */ }
  }
  return null;
}

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
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

function TicketRow({ ticket, user, technician, isLast, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <Box onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} sx={{
        display: "flex", alignItems: "center", gap: "14px", padding: "13px 16px",
        borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priorite] || "#E5E7EB"}`,
        borderRadius: "0 10px 10px 0",
        backgroundColor: hovered ? "#F8FAFF" : "transparent",
        transition: "background 0.15s",
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: PRIORITY_BORDER[ticket.priorite] || "#E5E7EB", boxShadow: `0 0 0 3px ${(PRIORITY_BORDER[ticket.priorite] || "#E5E7EB")}22` }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mb: "3px" }}>
            {ticket.titre}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "4px", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#9CA3AF" }}>
              {DashboardIcon.calendar}
              {/* _createdAt figé au chargement, jamais écrasé, extrait via ObjectId en fallback */}
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                {ticket._createdAt ? formatDate(ticket._createdAt) : "—"}
              </Typography>
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

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 90, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box sx={{ color: "#9CA3AF", display: "flex", alignItems: "center" }}><UserIcon /></Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Créé par</Typography>
          </Box>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserAvatar name={user.nom} color="#2563EB" size={24} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.nom.split(" ")[0]}
              </Typography>
            </Box>
          ) : <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>—</Typography>}
        </Box>

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

        <Box sx={{ flexShrink: 0, minWidth: 72 }}><Badge status={ticket.statut} /></Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity 0.15s", pointerEvents: hovered ? "auto" : "none" }}>
          <Tooltip title="Modifier" arrow placement="top">
            <Box component="button" onClick={e => { e.stopPropagation(); onEdit(ticket); }} sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", transition: "all 0.15s", "&:hover": { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", color: "#2563EB" } }}>
              <EditIcon />
            </Box>
          </Tooltip>
          <Tooltip title="Supprimer" arrow placement="top">
            <Box component="button" onClick={e => { e.stopPropagation(); onDelete(ticket); }} sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", transition: "all 0.15s", "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#EF4444" } }}>
              <TrashIcon />
            </Box>
          </Tooltip>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: "#F3F4F6", mx: "18px" }} />}
    </>
  );
}

export default function Tickets() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [rawTickets,   setRawTickets]   = useState([]);
  const [allUsers,     setAllUsers]     = useState([]);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([ticketService.getAll(), userService.getAll()])
      .then(([tRes, uRes]) => {
        const t = tRes.data || tRes;
        const u = uRes.data || uRes;
        setRawTickets(t.map(x => ({
          ...x,
          id: x._id || x.id,
          // extractCreatedAt tente createdAt → dateCreation → ObjectId timestamp
          // Résultat figé dans _createdAt, jamais écrasé par handleSave
          _createdAt: extractCreatedAt(x),
        })));
        setAllUsers(u.map(x => ({ ...x, id: x._id || x.id })));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const resolveUser = useCallback((id) => {
    if (!id) return null;
    const uid = typeof id === "object" ? (id._id || id.id) : id;
    return allUsers.find(u => u.id === uid || u._id === uid) || null;
  }, [allUsers]);

  const enrichedTickets = useMemo(() =>
    rawTickets.map(t => ({
      ...t,
      user:   resolveUser(t.auteurId),
      technician: resolveUser(t.technicienId),
    })),
    [rawTickets, resolveUser]
  );

  const counts = useMemo(() => ({
    all:         enrichedTickets.length,
    open:        enrichedTickets.filter(t => t.statut === "open").length,
    assigned:    enrichedTickets.filter(t => t.statut === "assigned").length,
    in_progress: enrichedTickets.filter(t => t.statut === "in_progress").length,
    resolved:    enrichedTickets.filter(t => t.statut === "resolved").length,
    closed:      enrichedTickets.filter(t => t.statut === "closed").length,
  }), [enrichedTickets]);

  const filteredTickets = useMemo(() => {
    let result = [...enrichedTickets].sort((a, b) =>
      new Date(b._createdAt || 0) - new Date(a._createdAt || 0)
    );
    if (activeFilter !== "all") result = result.filter(t => t.statut === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.titre?.toLowerCase().includes(q) ||
        t.localisation?.toLowerCase().includes(q) ||
        t.categorie?.toLowerCase().includes(q) ||
        t.user?.nom?.toLowerCase().includes(q) ||
        t.technician?.nom?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrichedTickets, activeFilter, search]);

  const handleSave = async (updated) => {
    try {
      await ticketService.update(updated.id || updated._id, updated);
      setRawTickets(prev => prev.map(t => {
        if (t.id !== (updated.id || updated._id)) return t;
        // _createdAt préservé — la date de création ne change JAMAIS
        return { ...t, ...updated, _createdAt: t._createdAt };
      }));
      setEditTarget(null);
      showToast("Ticket mis à jour avec succès.", "success");
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await ticketService.delete(deleteTarget.id || deleteTarget._id);
      setRawTickets(prev => prev.filter(t =>
        t.id !== (deleteTarget.id || deleteTarget._id)
      ));
      setDeleteTarget(null);
      showToast("Ticket supprimé définitivement.", "delete");
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    }
  };

  return (
    <Box sx={{ pb: "80px", position: "relative" }}>

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

      <Box sx={{ mb: "28px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "10px" }}>
          <Box sx={{ width: 28, height: 2, backgroundColor: "#2563EB", borderRadius: 1 }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.12em" }}>Administration</Typography>
        </Box>
        <Typography sx={{ fontSize: "32px", fontWeight: 800, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15, letterSpacing: "-0.3px", mb: "6px" }}>
          Tous les tickets
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>Vue globale de l'ensemble des tickets de la plateforme</Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Box sx={{ padding: "16px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px", gap: "12px", flexWrap: "wrap" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Liste des tickets</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "1px" }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}{search ? " trouvés" : " affichés"} · Survolez une ligne pour les actions
              </Typography>
            </Box>
            <TextField size="small" placeholder="Rechercher un ticket, employé, lieu…" value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Box sx={{ color: "#9CA3AF", display: "flex", alignItems: "center", mr: "4px" }}><SearchIcon /></Box> }}
              sx={{ minWidth: { xs: "100%", sm: 280 }, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px", backgroundColor: "#F9FAFB", "& fieldset": { borderColor: "#E5E7EB" }, "&:hover fieldset": { borderColor: "#D1D5DB" }, "&.Mui-focused fieldset": { borderColor: "#2563EB" } } }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: "4px", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab.key;
              const count    = counts[tab.key] ?? 0;
              return (
                <Box key={tab.key} onClick={() => setActiveFilter(tab.key)} sx={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 13px", cursor: "pointer", flexShrink: 0, borderRadius: "8px 8px 0 0", borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent", backgroundColor: isActive ? "#F0F7FF" : "transparent", transition: "all 0.15s", "&:hover": { backgroundColor: isActive ? "#F0F7FF" : "#F9FAFB" } }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#2563EB" : "#6B7280" }}>{tab.label}</Typography>
                  <Box sx={{ backgroundColor: isActive ? "#2563EB" : "#E5E7EB", color: isActive ? "#FFFFFF" : "#6B7280", borderRadius: "20px", padding: "0 6px", fontSize: "11px", fontWeight: 700, lineHeight: "18px", minWidth: "18px", textAlign: "center" }}>{count}</Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ padding: "8px 6px 12px" }}>
          {loading ? (
            <SkeletonLoader type="row" height={14} count={8} gap={0} />
          ) : filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "48px 24px" }}>
              <Box sx={{ fontSize: "36px", mb: "12px" }}>🔍</Box>
              <Typography sx={{ fontWeight: 600, color: "#6B7280", mb: "4px", fontSize: "14px" }}>Aucun ticket trouvé</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Essayez de modifier les filtres ou le terme de recherche</Typography>
            </Box>
          ) : (
            filteredTickets.map((ticket, index) => (
              <TicketRow key={ticket.id || ticket._id} ticket={ticket}
                user={ticket.user} technician={ticket.technician}
                isLast={index === filteredTickets.length - 1}
                onEdit={setEditTarget} onDelete={setDeleteTarget} />
            ))
          )}
        </Box>
      </Paper>

      {editTarget   && <EditModal   ticket={editTarget}   onClose={() => setEditTarget(null)}   onSave={handleSave}   />}
      {deleteTarget && <DeleteModal ticket={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </Box>
  );
}