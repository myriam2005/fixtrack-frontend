// ============================================================
//  FixTrack — Auth Pages (Login + Sign Up)
//  Stack : React 18 · Material UI v5 · Emotion
//  File  : src/pages/auth/FixTrackAuth.jsx  (demo entry point)
// ============================================================

import { useState } from "react";
import {
  ThemeProvider, createTheme, CssBaseline,
  Box, Typography, TextField, Button, IconButton,
  InputAdornment, Checkbox, FormControlLabel,
  Divider, Link, Alert, CircularProgress,
  LinearProgress, Chip, Paper, Grid,
  Select, MenuItem, FormControl,
  FormHelperText,
} from "@mui/material";
import {
  Visibility, VisibilityOff, Email, Lock,
  Person, Business, ArrowForward, CheckCircle,
  Build, Engineering, AdminPanelSettings,
  SupervisedUserCircle, Diamond,
} from "@mui/icons-material";

// ────────────────────────────────────────────────────────────
//  THEME  (palette exacte demandée)
// ────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#2563EB", light: "#3B82F6", dark: "#1D4ED8" },
    success:    { main: "#22C55E" },
    warning:    { main: "#F59E0B" },
    info:       { main: "#3B82F6" },
    error:      { main: "#EF4444" },
    background: { default: "#F3F4F6", paper: "#FFFFFF" },
    text:       { primary: "#111827", secondary: "#6B7280" },
    divider:    "#E5E7EB",
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingY: 12, fontWeight: 600 },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
            boxShadow: "0 6px 20px rgba(37,99,235,0.45)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#F9FAFB",
            "& fieldset": { borderColor: "#E5E7EB" },
            "&:hover fieldset": { borderColor: "#2563EB" },
            "&.Mui-focused fieldset": { borderColor: "#2563EB" },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: "#F9FAFB" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
  },
});

// ────────────────────────────────────────────────────────────
//  SIDEBAR PANEL  (left decorative panel)
// ────────────────────────────────────────────────────────────
const SidePanel = ({ mode }) => {
  const features = [
    { icon: <Build sx={{ fontSize: 16 }} />, text: "Gestion des tickets de maintenance" },
    { icon: <Engineering sx={{ fontSize: 16 }} />, text: "Assignation intelligente (IA)" },
    { icon: <SupervisedUserCircle sx={{ fontSize: 16 }} />, text: "Dashboards par rôle" },
    { icon: <AdminPanelSettings sx={{ fontSize: 16 }} />, text: "Reporting & analytics temps réel" },
  ];

  return (
    <Box
      sx={{
        background: "linear-gradient(160deg, #1E3A5F 0%, #1a3255 50%, #122544 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 5,
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: "auto", md: "100%" },
      }}
    >
      {/* Background decorative circles */}
      {[
        { size: 320, top: -80, right: -80, opacity: 0.05 },
        { size: 200, bottom: 60, left: -60, opacity: 0.07 },
        { size: 120, top: "40%", right: 40, opacity: 0.04 },
      ].map((c, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: c.size, height: c.size,
            borderRadius: "50%",
            border: `1.5px solid rgba(255,255,255,${c.opacity * 2})`,
            background: `rgba(255,255,255,${c.opacity})`,
            top: c.top, bottom: c.bottom, left: c.left, right: c.right,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Logo */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
          <Box
            sx={{
              width: 40, height: 40,
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
            }}
          >
            <Diamond sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.3 }}>
            FixTrack
          </Typography>
        </Box>

        {/* Headline */}
        <Typography variant="h4" sx={{ color: "#fff", mb: 1.5, lineHeight: 1.25, fontSize: { xs: 24, md: 28 } }}>
          {mode === "login" ? "Efficiency in\nMaintenance" : "Start Managing\nSmarter Today"}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, mb: 4 }}>
          {mode === "login"
            ? "The complete ecosystem for tracking repairs, managing assets, and optimizing your facility operations."
            : "Start managing your maintenance workflows efficiently with AI-powered tools."}
        </Typography>

        {/* Feature list */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {features.map((f, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28, height: 28,
                  borderRadius: 1.5,
                  background: "rgba(37,99,235,0.3)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#3B82F6",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                {f.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom illustration placeholder */}
      <Box
        sx={{
          mt: 5,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.1)",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: "rgba(37,99,235,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Engineering sx={{ color: "#3B82F6", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
            Maintenance Pro Platform
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Trusted by 500+ maintenance teams
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ────────────────────────────────────────────────────────────
//  PASSWORD STRENGTH  helper
// ────────────────────────────────────────────────────────────
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "error" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { score: 1, label: "Faible", color: "error" },
    { score: 2, label: "Moyen", color: "warning" },
    { score: 3, label: "Bien", color: "info" },
    { score: 4, label: "Excellent", color: "success" },
  ];
  return levels.find(l => l.score === score) || { score: 0, label: "", color: "error" };
};

// ────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ────────────────────────────────────────────────────────────
const LoginPage = ({ onSwitch }) => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email invalide";
    if (!password) errs.password = "Le mot de passe est requis";
    else if (password.length < 6) errs.password = "Minimum 6 caractères";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    setError("");
    // Simulate API call
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    // Demo: show error for wrong credentials
    if (password !== "fixtrack2025") {
      setError("Email ou mot de passe incorrect. (Essayez: fixtrack2025)");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "text.primary", mb: 0.75, fontSize: { xs: 24, md: 28 } }}>
          Welcome Back
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Please enter your details to sign in.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Email */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
          Email Address
        </Typography>
        <TextField
          fullWidth
          placeholder="name@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Password */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
            Password
          </Typography>
          <Link
            component="button"
            type="button"
            underline="hover"
            sx={{ fontSize: 13, color: "primary.main", fontWeight: 500 }}
          >
            Forgot Password?
          </Link>
        </Box>
        <TextField
          fullWidth
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPass(v => !v)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showPass
                    ? <VisibilityOff sx={{ fontSize: 18, color: "text.secondary" }} />
                    : <Visibility sx={{ fontSize: 18, color: "text.secondary" }} />
                  }
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Remember me */}
      <FormControlLabel
        control={
          <Checkbox
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            size="small"
            sx={{ color: "#E5E7EB", "&.Mui-checked": { color: "primary.main" } }}
          />
        }
        label={
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Remember me for 30 days
          </Typography>
        }
        sx={{ mb: 3, mt: 0.5 }}
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        endIcon={loading ? null : <ArrowForward />}
        sx={{ py: 1.5, mb: 3, fontSize: 15, position: "relative" }}
      >
        {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
      </Button>

      {/* Demo hint */}
      <Box sx={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 2, p: 1.5, mb: 3 }}>
        <Typography sx={{ fontSize: 12, color: "#0369A1", textAlign: "center" }}>
          💡 <strong>Démo</strong> — Email: <code>admin@fixtrack.app</code> · MDP: <code>fixtrack2025</code>
        </Typography>
      </Box>

      {/* Sign up link */}
      <Divider sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary", px: 1 }}>ou</Typography>
      </Divider>
      <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onSwitch}
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          Contact Administrator
        </Link>
      </Typography>
    </Box>
  );
};

// ────────────────────────────────────────────────────────────
//  SIGN UP PAGE
// ────────────────────────────────────────────────────────────
const ROLES = [
  { value: "employee",   label: "👤 Employé",       desc: "Signaler des pannes" },
  { value: "technician", label: "🔧 Technicien",     desc: "Gérer les interventions" },
  { value: "manager",    label: "📊 Manager",        desc: "Superviser les opérations" },
  { value: "admin",      label: "⚙️ Administrateur", desc: "Gérer le système" },
];

const SignUpPage = ({ onSwitch }) => {
  const [form, setForm] = useState({
    fullName: "", email: "", company: "", role: "",
    password: "", confirmPassword: "", agree: false,
  });
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errors, setErrors]         = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value ?? e.target.checked }));
  const setCheck = (e) => setForm(f => ({ ...f, agree: e.target.checked }));

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Nom requis";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email valide requis";
    if (!form.company.trim()) e.company = "Entreprise requise";
    if (!form.role) e.role = "Sélectionnez un rôle";
    if (!form.password || form.password.length < 8) e.password = "Minimum 8 caractères";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!form.agree) e.agree = "Vous devez accepter les conditions";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <Box sx={{ textAlign: "center", py: 4, width: "100%", maxWidth: 420 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#F0FDF4", border: "2px solid #22C55E",
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 3,
        }}>
          <CheckCircle sx={{ fontSize: 36, color: "success.main" }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 1 }}>Compte créé !</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3 }}>
          Votre demande a été envoyée à l'administrateur.<br />
          Vous recevrez un email de confirmation sous 24h.
        </Typography>
        <Chip
          label={`Rôle demandé : ${ROLES.find(r => r.value === form.role)?.label}`}
          sx={{ background: "#EFF6FF", color: "primary.dark", fontWeight: 600, mb: 3 }}
        />
        <Button variant="contained" fullWidth size="large" onClick={onSwitch} sx={{ py: 1.5 }}>
          Retour à la connexion
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 480 }}>
      {/* Logo + header */}
      <Box sx={{ textAlign: "center", mb: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
          <Box sx={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #2563EB, #3B82F6)",
            borderRadius: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Diamond sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}>
            FixTrack
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ mb: 0.5 }}>Create your account</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
          Start managing your maintenance workflows efficiently.
        </Typography>
      </Box>

      {/* Full Name */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>Full Name</Typography>
        <TextField
          fullWidth placeholder="John Doe"
          value={form.fullName} onChange={set("fullName")}
          error={!!errors.fullName} helperText={errors.fullName}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
          }}
        />
      </Box>

      {/* Email + Company row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>Work Email</Typography>
          <TextField
            fullWidth placeholder="name@company.com"
            value={form.email} onChange={set("email")}
            error={!!errors.email} helperText={errors.email}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>Company Name</Typography>
          <TextField
            fullWidth placeholder="FixTrack Inc."
            value={form.company} onChange={set("company")}
            error={!!errors.company} helperText={errors.company}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Business sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      {/* Role select */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>Your Role</Typography>
        <FormControl fullWidth error={!!errors.role}>
          <Select
            displayEmpty
            value={form.role}
            onChange={set("role")}
            renderValue={(v) => v ? ROLES.find(r => r.value === v)?.label : <span style={{ color: "#9CA3AF" }}>Select your professional role</span>}
            sx={{
              borderRadius: 2, backgroundColor: "#F9FAFB",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB" },
            }}
          >
            {ROLES.map(r => (
              <MenuItem key={r.value} value={r.value}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{r.desc}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
        </FormControl>
      </Box>

      {/* Password */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>Password</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>MIN. 8 CHARACTERS</Typography>
        </Box>
        <TextField
          fullWidth type={showPass ? "text" : "password"}
          placeholder="••••••••"
          value={form.password} onChange={set("password")}
          error={!!errors.password} helperText={errors.password}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? <VisibilityOff sx={{ fontSize: 18, color: "text.secondary" }} /> : <Visibility sx={{ fontSize: 18, color: "text.secondary" }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {/* Password strength bar */}
        {form.password && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(strength.score / 4) * 100}
              color={strength.color}
              sx={{ height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" }}
            />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: `${strength.color}.main`, mt: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {strength.label}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Confirm Password */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>Confirm Password</Typography>
        <TextField
          fullWidth type={showConf ? "text" : "password"}
          placeholder="••••••••"
          value={form.confirmPassword} onChange={set("confirmPassword")}
          error={!!errors.confirmPassword} helperText={errors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {form.confirmPassword && form.confirmPassword === form.password
                  ? <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />
                  : <Lock sx={{ fontSize: 18, color: "text.secondary" }} />
                }
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowConf(v => !v)} tabIndex={-1}>
                  {showConf ? <VisibilityOff sx={{ fontSize: 18, color: "text.secondary" }} /> : <Visibility sx={{ fontSize: 18, color: "text.secondary" }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Terms */}
      <FormControlLabel
        control={
          <Checkbox
            checked={form.agree}
            onChange={setCheck}
            size="small"
            sx={{ color: "#E5E7EB", "&.Mui-checked": { color: "primary.main" }, mt: -0.5, alignSelf: "flex-start" }}
          />
        }
        label={
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>
            By creating an account, you agree to FixTrack's{" "}
            <Link underline="hover" sx={{ color: "primary.main", fontWeight: 500 }}>Terms of Service</Link>
            {" "}and{" "}
            <Link underline="hover" sx={{ color: "primary.main", fontWeight: 500 }}>Privacy Policy</Link>
            , including cookie use.
          </Typography>
        }
        sx={{ alignItems: "flex-start", mb: errors.agree ? 0.5 : 2 }}
      />
      {errors.agree && (
        <Typography sx={{ fontSize: 12, color: "error.main", mb: 2, ml: 4 }}>{errors.agree}</Typography>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        endIcon={loading ? null : <ArrowForward />}
        sx={{ py: 1.5, mb: 2.5, fontSize: 15 }}
      >
        {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create Account"}
      </Button>

      {/* Sign in link */}
      <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
        Already have an account?{" "}
        <Link component="button" type="button" underline="hover" onClick={onSwitch} sx={{ fontWeight: 600, color: "primary.main" }}>
          Sign In
        </Link>
      </Typography>
    </Box>
  );
};

// ────────────────────────────────────────────────────────────
//  LAYOUT WRAPPER  (two-column)
// ────────────────────────────────────────────────────────────
const AuthLayout = ({ children, mode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1E3A5F 0%, #1a3255 40%, #152b4e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: { xs: 2, md: 3 },
    }}
  >
    <Paper
      elevation={0}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
        minHeight: { xs: "auto", md: 600 },
        width: "100%",
        maxWidth: { xs: 480, md: 920 },
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left panel — hidden on xs */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <SidePanel mode={mode} />
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
          overflowY: "auto",
          maxHeight: { md: "90vh" },
        }}
      >
        {children}
      </Box>
    </Paper>

    {/* Footer */}
    <Box
      sx={{
        position: "fixed", bottom: 16, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 3,
      }}
    >
      {["© 2024 FixTrack Maintenance System. All rights reserved.", "Terms of Service", "Privacy Policy", "Contact Support"].map((t, i) => (
        <Typography key={i} sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)", cursor: i > 0 ? "pointer" : "default", "&:hover": i > 0 ? { color: "rgba(255,255,255,0.65)" } : {} }}>
          {t}
        </Typography>
      ))}
    </Box>
  </Box>
);

// ────────────────────────────────────────────────────────────
//  ROOT APP  (demo router)
// ────────────────────────────────────────────────────────────
export default function FixTrackAuth() {
  const [mode, setMode] = useState("login");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthLayout mode={mode}>
        {mode === "login"
          ? <LoginPage onSwitch={() => setMode("signup")} />
          : <SignUpPage onSwitch={() => setMode("login")} />
        }
      </AuthLayout>
    </ThemeProvider>
  );
}