// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import {
  TextField, Button, Checkbox, FormControlLabel,
  Link, Alert, CircularProgress, Divider,
  InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import SidePanel from "../../components/auth/SidePanel";
import styles from "./auth.module.css";

// ─── Comptes démo (à remplacer par appel API réel) ────────────────────────────
const DEMO_ACCOUNTS = {
  "employee@fixtrack.app":   { role: "employee",   name: "Jean Dupont"   },
  "tech@fixtrack.app":       { role: "technician", name: "Ahmed Belhaj"  },
  "manager@fixtrack.app":    { role: "manager",    name: "Sara Mansour"  },
  "admin@fixtrack.app":      { role: "admin",      name: "Admin Système" },
};
const DEMO_PASSWORD = "fixtrack2025";

export default function LoginPage({ onSwitchToSignup, onLoginSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email)                            e.email    = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Adresse email invalide";
    if (!password)                         e.password = "Le mot de passe est requis";
    else if (password.length < 6)          e.password = "Minimum 6 caractères";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    // Vérification démo — remplacer par : const res = await authService.login(email, password)
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || password !== DEMO_PASSWORD) {
      setApiError("Email ou mot de passe incorrect.");
      return;
    }

    // Stocker l'utilisateur connecté
    localStorage.setItem("currentUser", JSON.stringify({
      name:  account.name,
      role:  account.role,
      email: email.toLowerCase(),
    }));

    // Callback vers App.jsx → déclenche la redirection
    if (onLoginSuccess) onLoginSuccess(account.role);
    else window.location.href = `/${account.role}/dashboard`;
  };

  const clearErr = (f) => setErrors((p) => { const n = { ...p }; delete n[f]; return n; });

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <SidePanel mode="login" />

        <div className={styles.formPanel}>
          <div className={styles.formInner}>

            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Welcome Back 👋</h1>
              <p className={styles.formSub}>Connectez-vous à votre espace de travail.</p>
            </div>

            {apiError && (
              <Alert severity="error" onClose={() => setApiError("")}
                sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
                {apiError}
              </Alert>
            )}

            {/* Hint comptes démo */}
            <div className={styles.demoHint}>
              💡 <strong>Démo</strong> — MDP universel : <code>fixtrack2025</code><br />
              <span style={{ fontSize: 11 }}>
                employee@ · tech@ · manager@ · admin@ <em>(@fixtrack.app)</em>
              </span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth label="Adresse email" type="email"
                placeholder="nom@fixtrack.app"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                error={!!errors.email} helperText={errors.email}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <div className={styles.fieldLabelRow}>
                <label className={styles.fieldLabel}>Mot de passe</label>
                <span className={styles.forgotLink}>Mot de passe oublié ?</span>
              </div>
              <TextField
                fullWidth type={showPass ? "text" : "password"}
                placeholder="••••••••" value={password}
                onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                error={!!errors.password} helperText={errors.password}
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ fontSize: 18, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((v) => !v)} edge="end" tabIndex={-1} size="small">
                        {showPass
                          ? <VisibilityOff sx={{ fontSize: 18, color: "#94a3b8" }} />
                          : <Visibility   sx={{ fontSize: 18, color: "#94a3b8" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
                label={<span style={{ fontSize: 13, color: "#64748b" }}>Se souvenir de moi 30 jours</span>}
                sx={{ mb: 2.5 }}
              />

              <Button type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: 15, fontWeight: 600, mb: 2.5, borderRadius: 2 }}>
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Se connecter →"}
              </Button>
            </form>

            <Divider sx={{ mb: 2 }}>
              <span style={{ fontSize: 12, color: "#94a3b8", padding: "0 8px" }}>ou</span>
            </Divider>
            <p className={styles.authFooter}>
              Pas encore de compte ?{" "}
              <Link component="button" underline="hover" onClick={onSwitchToSignup}
                sx={{ fontWeight: 600, color: "primary.main", fontSize: 13 }}>
                Contacter l&apos;administrateur
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