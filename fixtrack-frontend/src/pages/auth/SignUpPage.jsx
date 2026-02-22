// src/pages/auth/SignUpPage.jsx
import { useState } from "react";
import {
  TextField, Button, Checkbox, FormControlLabel,
  Link, CircularProgress, FormControl, Select,
  MenuItem, FormHelperText, InputAdornment,
  IconButton, Chip, Divider, Alert,
} from "@mui/material";
import {
  Visibility, VisibilityOff, Email, Lock,
  Person, Business, CheckCircle,
} from "@mui/icons-material";
import SidePanel from "../../components/auth/SidePanel";
import PasswordStrength from "../../components/auth/PasswordStrength";
import styles from "./auth.module.css";

const ROLES = [
  { value: "employee",   label: "👤 Employé",       desc: "Signaler des pannes" },
  { value: "technician", label: "🔧 Technicien",     desc: "Gérer les interventions" },
  { value: "manager",    label: "📊 Manager",        desc: "Superviser les opérations" },
  { value: "admin",      label: "⚙️ Administrateur", desc: "Gérer le système" },
];

export default function SignUpPage({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    fullName: "", email: "", company: "",
    role: "", password: "", confirmPassword: "", agree: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                         e.fullName = "Nom complet requis";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email valide requis";
    if (!form.company.trim())                          e.company = "Entreprise requise";
    if (!form.role)                                    e.role = "Sélectionnez un rôle";
    if (!form.password || form.password.length < 8)   e.password = "Minimum 8 caractères";
    if (form.password !== form.confirmPassword)        e.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!form.agree)                                   e.agree = "Vous devez accepter les conditions";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
  };

  const passMatch = form.confirmPassword && form.confirmPassword === form.password;

  // ── Success screen ────────────────────────────────────────
  if (success) {
    const roleName = ROLES.find((r) => r.value === form.role)?.label ?? form.role;
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <SidePanel mode="signup" />
          <div className={styles.formPanel}>
            <div className={styles.formInner}>
              <div className={styles.successState}>
                <div className={styles.successIcon}>✅</div>
                <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
                  Compte créé !
                </h2>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  Demande envoyée à l&apos;administrateur.<br />
                  Confirmation par email sous 24h.
                </p>
                <Chip label={`Rôle : ${roleName}`}
                  sx={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 600, mb: 3 }} />
                <br />
                <Button variant="contained" size="large" fullWidth
                  onClick={onSwitchToLogin} sx={{ py: 1.5, borderRadius: 2 }}>
                  Retour à la connexion →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>

        {/* Left panel */}
        <SidePanel mode="signup" />

        {/* Right form */}
        <div className={styles.formPanel}>
          <div className={`${styles.formInner} ${styles.formInnerWide}`}>

            {/* Centered logo header */}
            <div className={styles.signupLogoHeader}>
              <div className={styles.signupLogoRow}>
                <div className={styles.signupLogoIcon}>◆</div>
                <span className={styles.signupLogoText}>FixTrack</span>
              </div>
              <h1 className={styles.formTitle} style={{ textAlign: "center", marginBottom: 4 }}>
                Créer un compte
              </h1>
              <p className={styles.formSub} style={{ textAlign: "center" }}>
                Gérez vos opérations de maintenance efficacement.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <TextField fullWidth label="Nom complet" placeholder="Jean Dupont"
                value={form.fullName} onChange={set("fullName")}
                error={!!errors.fullName} helperText={errors.fullName}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
                }}
              />

              {/* Email + Company */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <TextField fullWidth label="Email pro" type="email" placeholder="nom@ent.com"
                  value={form.email} onChange={set("email")}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
                  }}
                />
                <TextField fullWidth label="Entreprise" placeholder="FixTrack Inc."
                  value={form.company} onChange={set("company")}
                  error={!!errors.company} helperText={errors.company}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Business sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
                  }}
                />
              </div>

              {/* Role */}
              <FormControl fullWidth error={!!errors.role} sx={{ mb: 2 }}>
                <label className={styles.fieldLabel}>Votre rôle</label>
                <Select displayEmpty value={form.role} onChange={set("role")}
                  renderValue={(v) => v
                    ? ROLES.find((r) => r.value === v)?.label
                    : <span style={{ color: "#9CA3AF" }}>Sélectionnez votre rôle</span>
                  }
                  sx={{ borderRadius: 2, backgroundColor: "#f8fafc" }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{r.desc}</div>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>

              {/* Password */}
              <div style={{ marginBottom: 14 }}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel} style={{ margin: 0 }}>Mot de passe</label>
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    MIN. 8 CARACTÈRES
                  </span>
                </div>
                <TextField fullWidth type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={set("password")}
                  error={!!errors.password} helperText={errors.password}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass((v) => !v)} edge="end" tabIndex={-1} size="small">
                          {showPass ? <VisibilityOff sx={{ fontSize: 18, color: "#94a3b8" }} /> : <Visibility sx={{ fontSize: 18, color: "#94a3b8" }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <TextField fullWidth label="Confirmer le mot de passe"
                type={showConf ? "text" : "password"} placeholder="••••••••"
                value={form.confirmPassword} onChange={set("confirmPassword")}
                error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {passMatch
                        ? <CheckCircle sx={{ fontSize: 18, color: "#22c55e" }} />
                        : <Lock sx={{ fontSize: 18, color: "#94a3b8" }} />}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConf((v) => !v)} edge="end" tabIndex={-1} size="small">
                        {showConf ? <VisibilityOff sx={{ fontSize: 18, color: "#94a3b8" }} /> : <Visibility sx={{ fontSize: 18, color: "#94a3b8" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Terms */}
              <FormControlLabel
                control={<Checkbox checked={form.agree} onChange={set("agree")} size="small" sx={{ alignSelf: "flex-start", mt: "-2px" }} />}
                label={
                  <span style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>
                    J&apos;accepte les{" "}
                    <Link underline="hover" sx={{ color: "primary.main", fontWeight: 500, fontSize: "inherit" }}>
                      Conditions d&apos;utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link underline="hover" sx={{ color: "primary.main", fontWeight: 500, fontSize: "inherit" }}>
                      Politique de confidentialité
                    </Link>.
                  </span>
                }
                sx={{ alignItems: "flex-start", mb: errors.agree ? 0.5 : 2 }}
              />
              {errors.agree && (
                <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, marginLeft: 30, marginTop: 0 }}>
                  {errors.agree}
                </p>
              )}

              {/* Submit */}
              <Button type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: 15, fontWeight: 600, mb: 2, borderRadius: 2 }}>
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Créer mon compte →"}
              </Button>

            </form>

            <Divider sx={{ mb: 1.5 }}>
              <span style={{ fontSize: 12, color: "#94a3b8", padding: "0 8px" }}>ou</span>
            </Divider>
            <p className={styles.authFooter}>
              Déjà un compte ?{" "}
              <Link component="button" underline="hover" onClick={onSwitchToLogin}
                sx={{ fontWeight: 600, color: "primary.main", fontSize: 13 }}>
                Se connecter
              </Link>
            </p>

          </div>
        </div>
      </div>

      <div className={styles.pageFooter}>
        <span className={styles.pageFooterItem}>© 2024 FixTrack. All rights reserved.</span>
        {["Terms of Service", "Privacy Policy", "Support"].map((t) => (
          <span key={t} className={`${styles.pageFooterItem} ${styles.pageFooterLink}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}