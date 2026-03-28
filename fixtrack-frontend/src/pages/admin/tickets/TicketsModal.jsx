// src/pages/admin/tickets/TicketsModal.jsx
// FIX : le champ "Catégorie" est maintenant un Select dynamique chargé depuis
//       /api/config/categories + option "Autre" avec saisie libre.

import { useState, useEffect } from "react";
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
import { CloseIcon, AlertIcon, SaveIcon } from "../../../components/common/Icons";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeader() {
  try {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

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

// ── CategorySelect ─────────────────────────────────────────────────────────────
// Select dynamique : options = catégories de l'API + "Autre" (saisie libre)
const AUTRE_VALUE = "__autre__";

function CategorySelect({ value, onChange }) {
  const [categories, setCategories]   = useState([]);
  const [isCustom,   setIsCustom]     = useState(false);
  const [customText, setCustomText]   = useState("");

  // Charger les catégories depuis l'API au montage
  useEffect(() => {
    fetch(`${API_BASE}/config/categories`, { headers: getAuthHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Si la valeur initiale ne fait pas partie des catégories connues, c'est une valeur custom
  useEffect(() => {
    if (!value) return;
    if (value === AUTRE_VALUE) return;
    const known = categories.some(c => c.nom === value);
    if (!known && categories.length > 0) {
      setIsCustom(true);
      setCustomText(value);
    }
  }, [value, categories]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === AUTRE_VALUE) {
      setIsCustom(true);
      setCustomText("");
      onChange("");        // on efface en attendant la saisie
    } else {
      setIsCustom(false);
      setCustomText("");
      onChange(val);
    }
  };

  const handleCustomChange = (e) => {
    setCustomText(e.target.value);
    onChange(e.target.value);
  };

  // Valeur affichée dans le Select
  const selectValue = isCustom ? AUTRE_VALUE : (value || "");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Select
        value={selectValue}
        onChange={handleSelectChange}
        fullWidth
        size="small"
        displayEmpty
        sx={selectSx}
      >
        <MenuItem value="" disabled sx={{ fontSize: "13.5px", color: "#9CA3AF", fontStyle: "italic" }}>
          Sélectionner une catégorie…
        </MenuItem>

        {categories.map(cat => (
          <MenuItem key={cat._id || cat.nom} value={cat.nom} sx={{ fontSize: "13.5px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#6B7280", flexShrink: 0 }} />
              {cat.nom}
            </Box>
          </MenuItem>
        ))}

        {/* Séparateur */}
        {categories.length > 0 && (
          <MenuItem disabled sx={{ borderTop: "1px solid #F3F4F6", my: "2px", p: 0, minHeight: 0 }} />
        )}

        <MenuItem value={AUTRE_VALUE} sx={{ fontSize: "13.5px", color: "#D97706", fontWeight: 600 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{
              width: 16, height: 16, borderRadius: "4px",
              border: "1.5px dashed #D97706",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", color: "#D97706", flexShrink: 0,
            }}>+</Box>
            Autre (saisie libre)
          </Box>
        </MenuItem>
      </Select>

      {/* Champ de saisie libre — visible uniquement si "Autre" est choisi */}
      {isCustom && (
        <TextField
          autoFocus
          placeholder="Ex: Ascenseur, Menuiserie, Toiture…"
          value={customText}
          onChange={handleCustomChange}
          fullWidth
          size="small"
          sx={{
            ...fieldSx,
            "& .MuiOutlinedInput-root": {
              ...fieldSx["& .MuiOutlinedInput-root"],
              backgroundColor: "#FFFBEB",
              "& fieldset": { borderColor: "#FDE68A" },
              "&:hover fieldset": { borderColor: "#F59E0B" },
              "&.Mui-focused fieldset": { borderColor: "#D97706", borderWidth: "1.5px" },
            },
          }}
        />
      )}
    </Box>
  );
}

// ── EditModal ──────────────────────────────────────────────────────────────────
export function EditModal({ ticket, onClose, onSave }) {
  const [form, setForm] = useState({
    titre:        ticket.titre        || "",
    description:  ticket.description  || "",
    statut:       ticket.statut       || "open",
    priorite:     ticket.priorite     || "medium",
    localisation: ticket.localisation || "",
    categorie:    ticket.categorie    || "",
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
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #F3F4F6" }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>Modifier le ticket</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: "2px" }}>#{ticket.id} · Mis à jour par l'administrateur</Typography>
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: 34, height: 34, borderRadius: "8px", border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#9CA3AF", transition: "all 0.15s",
            "&:hover": { backgroundColor: "#F3F4F6", color: "#374151", borderColor: "#D1D5DB" },
          }}
        >
          <CloseIcon width="18" height="18" />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <TextField
          label="Titre du ticket"
          value={form.titre}
          onChange={e => set("titre", e.target.value)}
          fullWidth size="small"
          error={!!errors.titre} helperText={errors.titre}
          sx={fieldSx}
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={e => set("description", e.target.value)}
          fullWidth multiline rows={3} size="small"
          sx={fieldSx}
        />

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

        <TextField
          label="Localisation"
          value={form.localisation}
          onChange={e => set("localisation", e.target.value)}
          fullWidth size="small"
          error={!!errors.localisation} helperText={errors.localisation}
          sx={fieldSx}
        />

        {/* ── Catégorie — Select dynamique + Autre ── */}
        <Box>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", mb: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Catégorie
          </Typography>
          <CategorySelect value={form.categorie} onChange={val => set("categorie", val)} />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 24px 20px", borderTop: "1px solid #F3F4F6", backgroundColor: "#FAFAFA" }}>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            padding: "9px 20px", borderRadius: "9px", border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF", fontSize: "13.5px", fontWeight: 600, color: "#374151",
            cursor: "pointer", transition: "all 0.15s",
            "&:hover": { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" },
          }}
        >
          Annuler
        </Box>
        <Box
          component="button"
          onClick={handleSave}
          sx={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "9px 20px", borderRadius: "9px", border: "none",
            backgroundColor: "#2563EB", fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF",
            cursor: "pointer", transition: "all 0.15s",
            "&:hover": { backgroundColor: "#1D4ED8" },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          <SaveIcon width="14" height="14" stroke="#FFFFFF" /> Enregistrer
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
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" } }}
    >
      <Box sx={{ height: 4, background: "linear-gradient(90deg, #EF4444, #DC2626)", width: "100%" }} />

      <Box sx={{ padding: "28px 28px 0" }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", mb: "18px" }}>
          <AlertIcon width="26" height="26" stroke="#EF4444" />
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
            <Box
              component="span"
              sx={{ fontFamily: "monospace", backgroundColor: "#FEE2E2", padding: "1px 7px", borderRadius: "5px", letterSpacing: "0.05em" }}
            >
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
        <Box
          component="button"
          onClick={onClose}
          sx={{
            flex: 1, padding: "10px", borderRadius: "9px",
            border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
            fontSize: "13.5px", fontWeight: 600, color: "#374151",
            cursor: "pointer", transition: "all 0.15s",
            "&:hover": { backgroundColor: "#F3F4F6" },
          }}
        >
          Annuler
        </Box>
        <Tooltip title={!isReady ? `Saisissez "${ticket.id}" pour activer` : ""} arrow placement="top">
          <Box component="span" sx={{ flex: 1 }}>
            <Box
              component="button"
              onClick={isReady ? onConfirm : undefined}
              sx={{
                width: "100%", padding: "10px", borderRadius: "9px", border: "none",
                backgroundColor: isReady ? "#EF4444" : "#FCA5A5",
                fontSize: "13.5px", fontWeight: 700, color: "#FFFFFF",
                cursor: isReady ? "pointer" : "not-allowed",
                transition: "background 0.2s, transform 0.1s",
                "&:hover": isReady ? { backgroundColor: "#DC2626" } : {},
                "&:active": isReady ? { transform: "scale(0.98)" } : {},
              }}
            >
              Supprimer
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </Dialog>
  );
}