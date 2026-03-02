// src/pages/admin/TicketModals.jsx
// ─── Composants UI isolés : modales + sous-composants visuels ─────────────────
//  Exportés et utilisés par TousTickets.jsx

import { useState } from "react";
import {
  Box, Typography, TextField, Select, MenuItem, Dialog, Tooltip,
} from "@mui/material";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_CONFIG,
  PRIORITY_BORDER,
  fieldSx,
  selectSx,
} from "./TicketsModalConstants";

// ── Icônes SVG locales ─────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

// ── StatusTracker ──────────────────────────────────────────────────────────────

export function StatusTracker({ statut }) {
  const steps = [{ key: "open" }, { key: "in_progress" }, { key: "resolved" }];
  const visualStep =
    statut === "closed" || statut === "resolved"      ? 3 :
    statut === "in_progress" || statut === "assigned" ? 2 : 1;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, mt: "5px" }}>
      {steps.map((step, i) => {
        const done    = i + 1 <= visualStep;
        const current = i + 1 === visualStep;
        return (
          <Box key={step.key} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{
              width: current ? 10 : 7, height: current ? 10 : 7, borderRadius: "50%",
              backgroundColor: done ? (current ? "#2563EB" : "#93C5FD") : "#E5E7EB",
              border: current ? "2px solid #DBEAFE" : "none",
              boxShadow: current ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
              transition: "all 0.2s", flexShrink: 0,
            }} />
            {i < steps.length - 1 && (
              <Box sx={{ width: 22, height: 2, mx: "2px", backgroundColor: i + 1 < visualStep ? "#93C5FD" : "#E5E7EB", borderRadius: 1 }} />
            )}
          </Box>
        );
      })}
      <Typography sx={{ ml: "7px", fontSize: "11px", fontWeight: 600, color: STATUS_CONFIG[statut]?.color || "#6B7280" }}>
        {STATUS_CONFIG[statut]?.label || statut}
      </Typography>
    </Box>
  );
}

// ── UserAvatar ─────────────────────────────────────────────────────────────────

export function UserAvatar({ name, color = "#2563EB", size = 28 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: color, color: "#FFFFFF",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </Box>
  );
}

// ── EditModal ──────────────────────────────────────────────────────────────────

export function EditModal({ ticket, onClose, onSave }) {
  const [form, setForm] = useState({
    titre:        ticket.titre,
    description:  ticket.description,
    statut:       ticket.statut,
    priorite:     ticket.priorite,
    localisation: ticket.localisation,
    categorie:    ticket.categorie || "",
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.titre.trim())        errs.titre        = "Le titre est obligatoire.";
    if (!form.localisation.trim()) errs.localisation = "La localisation est obligatoire.";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...ticket, ...form });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #F3F4F6" }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>Modifier le ticket</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "2px" }}>#{ticket.id} · Mis à jour par l'administrateur</Typography>
        </Box>
        <Box component="button" onClick={onClose} sx={{
          width: 34, height: 34, borderRadius: "8px", border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#9CA3AF", transition: "all 0.15s",
          "&:hover": { backgroundColor: "#F3F4F6", color: "#374151", borderColor: "#D1D5DB" },
        }}>
          <CloseIcon />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <TextField label="Titre du ticket" value={form.titre} onChange={e => set("titre", e.target.value)}
          fullWidth size="small" error={!!errors.titre} helperText={errors.titre} sx={fieldSx} />

        <TextField label="Description" value={form.description} onChange={e => set("description", e.target.value)}
          fullWidth multiline rows={3} size="small" sx={fieldSx} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", mb: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Statut
            </Typography>
            <Select value={form.statut} onChange={e => set("statut", e.target.value)} fullWidth size="small" sx={selectSx}>
              {STATUS_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "13.5px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: STATUS_CONFIG[o.value]?.color || "#9CA3AF", flexShrink: 0 }} />
                    {o.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", mb: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Priorité
            </Typography>
            <Select value={form.priorite} onChange={e => set("priorite", e.target.value)} fullWidth size="small" sx={selectSx}>
              {PRIORITY_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "13.5px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: PRIORITY_BORDER[o.value] || "#9CA3AF", flexShrink: 0 }} />
                    {o.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <TextField label="Localisation" value={form.localisation} onChange={e => set("localisation", e.target.value)}
          fullWidth size="small" error={!!errors.localisation} helperText={errors.localisation} sx={fieldSx} />

        <TextField label="Catégorie" value={form.categorie} onChange={e => set("categorie", e.target.value)}
          fullWidth size="small" sx={fieldSx} />
      </Box>

      {/* Footer */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 24px 20px", borderTop: "1px solid #F3F4F6", backgroundColor: "#FAFAFA" }}>
        <Box component="button" onClick={onClose} sx={{
          padding: "9px 20px", borderRadius: "9px", border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF", fontSize: "13.5px", fontWeight: 600, color: "#374151",
          cursor: "pointer", transition: "all 0.15s",
          "&:hover": { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" },
        }}>
          Annuler
        </Box>
        <Box component="button" onClick={handleSave} sx={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "9px 20px", borderRadius: "9px", border: "none",
          backgroundColor: "#2563EB", fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF",
          cursor: "pointer", transition: "all 0.15s",
          "&:hover": { backgroundColor: "#1D4ED8" },
          "&:active": { transform: "scale(0.98)" },
        }}>
          <SaveIcon /> Enregistrer
        </Box>
      </Box>
    </Dialog>
  );
}

// ── DeleteModal ────────────────────────────────────────────────────────────────

export function DeleteModal({ ticket, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const isReady = confirmText.trim() === ticket.id;

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" } }}
    >
      {/* Bande danger */}
      <Box sx={{ height: 4, background: "linear-gradient(90deg, #EF4444, #DC2626)", width: "100%" }} />

      <Box sx={{ padding: "28px 28px 0" }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", mb: "18px" }}>
          <AlertIcon />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#111827", mb: "8px" }}>
          Supprimer ce ticket ?
        </Typography>
        <Typography sx={{ fontSize: "13.5px", color: "#6B7280", lineHeight: 1.65, mb: "22px" }}>
          Cette action est <strong style={{ color: "#374151" }}>irréversible</strong>. Le ticket{" "}
          <strong style={{ color: "#111827" }}>«&nbsp;{ticket.titre}&nbsp;»</strong> sera définitivement supprimé de la plateforme.
        </Typography>

        <Box sx={{ backgroundColor: "#FFF8F8", border: "1px solid #FECACA", borderRadius: "10px", padding: "14px 16px", mb: "6px" }}>
          <Typography sx={{ fontSize: "12px", color: "#B91C1C", fontWeight: 600, mb: "10px" }}>
            Confirmez en saisissant l'identifiant :{" "}
            <Box component="span" sx={{ fontFamily: "monospace", backgroundColor: "#FEE2E2", padding: "1px 7px", borderRadius: "5px", letterSpacing: "0.05em" }}>
              {ticket.id}
            </Box>
          </Typography>
          <TextField
            placeholder={ticket.id}
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            fullWidth size="small" autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px", fontSize: "13px", fontFamily: "monospace", backgroundColor: "#FFFFFF",
                "& fieldset": { borderColor: isReady ? "#EF4444" : "#FECACA" },
                "&.Mui-focused fieldset": { borderColor: "#EF4444", borderWidth: "1.5px" },
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "10px", padding: "20px 28px 26px" }}>
        <Box component="button" onClick={onClose} sx={{
          flex: 1, padding: "10px", borderRadius: "9px",
          border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
          fontSize: "13.5px", fontWeight: 600, color: "#374151",
          cursor: "pointer", transition: "all 0.15s",
          "&:hover": { backgroundColor: "#F3F4F6" },
        }}>
          Annuler
        </Box>
        <Tooltip title={!isReady ? `Saisissez "${ticket.id}" pour activer` : ""} arrow placement="top">
          <Box component="span" sx={{ flex: 1 }}>
            <Box component="button" onClick={isReady ? onConfirm : undefined} sx={{
              width: "100%", padding: "10px", borderRadius: "9px", border: "none",
              backgroundColor: isReady ? "#EF4444" : "#FCA5A5",
              fontSize: "13.5px", fontWeight: 700, color: "#FFFFFF",
              cursor: isReady ? "pointer" : "not-allowed",
              transition: "background 0.2s, transform 0.1s",
              "&:hover": isReady ? { backgroundColor: "#DC2626" } : {},
              "&:active": isReady ? { transform: "scale(0.98)" } : {},
            }}>
              Supprimer
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </Dialog>
  );
}