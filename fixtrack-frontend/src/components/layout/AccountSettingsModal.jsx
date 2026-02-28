// src/components/layout/AccountSettingsModal.jsx
// ─────────────────────────────────────────────────────────────
//  Modale "Paramètres du compte" — accessible à tous les rôles
//  Props : open, onClose, user
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, Avatar, IconButton,
  TextField, Button, InputAdornment, alpha,
} from "@mui/material";

// ── Icônes SVG inline ─────────────────────────────────────────────────────────
const Ico = {
  close:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  user:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  lock:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ── Métadonnées des rôles ─────────────────────────────────────────────────────
const ROLE_META = {
  employee:   { label: "Employé",        color: "#059669", bg: "#ECFDF5", dot: "#10b981" },
  technician: { label: "Technicien",     color: "#d97706", bg: "#FFFBEB", dot: "#f59e0b" },
  manager:    { label: "Manager",        color: "#7c3aed", bg: "#F5F3FF", dot: "#8b5cf6" },
  admin:      { label: "Administrateur", color: "#1d4ed8", bg: "#EFF6FF", dot: "#3b82f6" },
};

// ── Tokens visuels (synchronisés avec Layout) ─────────────────────────────────
const T = {
  accent:      "#2563EB",
  accentHover: "#1d4ed8",
  accentLight: "#EFF6FF",
  bg:          "#F8FAFC",
  sidebar:     "#FFFFFF",
  border:      "#E2E8F0",
  borderLight: "#F1F5F9",
  text:        "#0F172A",
  textSub:     "#475569",
  textMuted:   "#94A3B8",
};

// ── Style partagé des TextField ───────────────────────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset":           { borderColor: "#E2E8F0" },
    "&:hover fieldset":     { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

// ── Composant principal ───────────────────────────────────────────────────────
export default function AccountSettingsModal({ open, onClose, user }) {
  const [tab, setTab]               = useState("profile");   // "profile" | "password"
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd]       = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors]         = useState({});
  const [saved, setSaved]           = useState(false);

  // Réinitialise les champs à chaque ouverture
  useEffect(() => {
    if (open) {
      setName(user?.name  || "");
      setEmail(user?.email || "");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setErrors({}); setSaved(false); setTab("profile");
    }
  }, [open, user]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateProfile = () => {
    const errs = {};
    if (!name.trim())  errs.name  = "Le nom est requis.";
    if (!email.trim()) errs.email = "L'e-mail est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Format d'e-mail invalide.";
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!currentPwd)           errs.currentPwd  = "Mot de passe actuel requis.";
    if (newPwd.length < 6)     errs.newPwd      = "Minimum 6 caractères.";
    if (newPwd !== confirmPwd) errs.confirmPwd  = "Les mots de passe ne correspondent pas.";
    return errs;
  };

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const errs = tab === "profile" ? validateProfile() : validatePassword();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // TODO : remplacer par l'appel API réel
    // tab === "profile"  → userService.updateProfile({ name, email })
    // tab === "password" → userService.changePassword({ currentPwd, newPwd })
    if (tab === "profile") {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
      localStorage.setItem("currentUser", JSON.stringify({ ...stored, name, email }));
    }

    setErrors({});
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  // ── Indicateur force du mot de passe ─────────────────────────────────────
  const pwdStrength = (() => {
    if (!newPwd) return 0;
    let s = 0;
    if (newPwd.length >= 8)          s++;
    if (/[A-Z]/.test(newPwd))        s++;
    if (/[0-9]/.test(newPwd))        s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    return s;
  })();
  const strengthMeta = [
    null,
    { label: "Faible",  color: "#EF4444" },
    { label: "Moyen",   color: "#F59E0B" },
    { label: "Bon",     color: "#3B82F6" },
    { label: "Fort",    color: "#22C55E" },
  ][pwdStrength];

  const togglePwd = (field) => setShowPwd(p => ({ ...p, [field]: !p[field] }));

  const role     = ROLE_META[user?.role] || ROLE_META.employee;
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(15,23,42,0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* ── En-tête dégradé ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${T.accent} 0%, #1d4ed8 100%)`,
        px: 3, pt: 3, pb: 2.5,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{
            width: 52, height: 52, fontSize: 18, fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.4)",
            color: "#fff",
          }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              Paramètres du compte
            </Typography>
            {/* Badge rôle dans l'en-tête */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.5,
              px: 0.9, py: 0.3, mt: 0.6, borderRadius: "5px",
              backgroundColor: "rgba(255,255,255,0.18)",
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#fff", opacity: 0.9 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {role.label}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose} size="small"
          sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.12)" } }}
        >
          {Ico.close}
        </IconButton>
      </Box>

      {/* ── Onglets ── */}
      <Box sx={{ display: "flex", borderBottom: `1px solid ${T.border}`, backgroundColor: T.sidebar }}>
        {[
          { id: "profile",  label: "Profil",       icon: Ico.user },
          { id: "password", label: "Mot de passe", icon: Ico.lock },
        ].map(t => (
          <Box
            key={t.id}
            onClick={() => { setTab(t.id); setErrors({}); setSaved(false); }}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              px: 2.5, py: 1.5, cursor: "pointer",
              borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
              color: tab === t.id ? T.accent : T.textMuted,
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 13.5,
              transition: "all 0.15s",
              "&:hover": { color: T.accent },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: tab === t.id ? T.accent : T.textMuted }}>
              {t.icon}
            </Box>
            {t.label}
          </Box>
        ))}
      </Box>

      {/* ── Corps ── */}
      <DialogContent sx={{ px: 3, py: 2.5, backgroundColor: T.bg }}>

        {/* Onglet Profil */}
        {tab === "profile" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom complet"
              value={name}
              onChange={e => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: T.textMuted, display: "flex" }}>{Ico.user}</Box>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <TextField
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth size="small"
              sx={fieldSx}
            />
            {/* Rôle — lecture seule */}
            <TextField
              label="Rôle"
              value={role.label}
              fullWidth size="small"
              disabled
              helperText="Le rôle est géré par l'administrateur."
              sx={fieldSx}
            />
          </Box>
        )}

        {/* Onglet Mot de passe */}
        {tab === "password" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Mot de passe actuel */}
            <TextField
              label="Mot de passe actuel"
              type={showPwd.current ? "text" : "password"}
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              error={!!errors.currentPwd}
              helperText={errors.currentPwd}
              fullWidth size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: T.textMuted, display: "flex" }}>{Ico.lock}</Box>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => togglePwd("current")} sx={{ color: T.textMuted }}>
                      {showPwd.current ? Ico.eyeOff : Ico.eye}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Nouveau mot de passe */}
            <TextField
              label="Nouveau mot de passe"
              type={showPwd.new ? "text" : "password"}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              error={!!errors.newPwd}
              helperText={errors.newPwd}
              fullWidth size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => togglePwd("new")} sx={{ color: T.textMuted }}>
                      {showPwd.new ? Ico.eyeOff : Ico.eye}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Barre de force */}
            {newPwd && (
              <Box>
                <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                  {[1, 2, 3, 4].map(i => (
                    <Box key={i} sx={{
                      flex: 1, height: 4, borderRadius: 2,
                      backgroundColor: i <= pwdStrength ? strengthMeta?.color : T.border,
                      transition: "background-color 0.2s",
                    }} />
                  ))}
                </Box>
                {strengthMeta && (
                  <Typography sx={{ fontSize: 11, color: strengthMeta.color, fontWeight: 600 }}>
                    {strengthMeta.label}
                  </Typography>
                )}
              </Box>
            )}

            {/* Confirmation */}
            <TextField
              label="Confirmer le nouveau mot de passe"
              type={showPwd.confirm ? "text" : "password"}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              error={!!errors.confirmPwd}
              helperText={errors.confirmPwd}
              fullWidth size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => togglePwd("confirm")} sx={{ color: T.textMuted }}>
                      {showPwd.confirm ? Ico.eyeOff : Ico.eye}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{
        px: 3, py: 2,
        borderTop: `1px solid ${T.border}`,
        backgroundColor: T.sidebar,
        gap: 1,
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "8px", textTransform: "none", fontWeight: 500,
            borderColor: T.border, color: T.textSub,
            "&:hover": { borderColor: T.textMuted, backgroundColor: T.borderLight },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saved ? Ico.check : null}
          sx={{
            borderRadius: "8px", textTransform: "none", fontWeight: 600,
            minWidth: 140,
            backgroundColor: saved ? "#22C55E" : T.accent,
            boxShadow: saved
              ? "0 2px 8px rgba(34,197,94,0.35)"
              : `0 2px 8px ${alpha(T.accent, 0.3)}`,
            "&:hover": { backgroundColor: saved ? "#16A34A" : T.accentHover },
            transition: "background-color 0.2s",
          }}
        >
          {saved ? "Enregistré !" : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}