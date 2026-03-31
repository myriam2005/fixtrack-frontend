// src/pages/auth/LoginPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const ROLE_META = {
  employee:   { label: "Employé",    color: "#22c55e", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)"  },
  technician: { label: "Technicien", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  manager:    { label: "Manager",    color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
  admin:      { label: "Admin",      color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)"  },
};

const DEMO_ACCOUNTS = [
  { id: "d1", nom: "Jean Dupont",   email: "jean@fst.tn",  password: "123456", role: "employee",   avatar: "JD" },
  { id: "d2", nom: "Sara Ben Ali",  email: "sara@fst.tn",  password: "123456", role: "technician", avatar: "SB" },
  { id: "d3", nom: "Lina Trabelsi", email: "lina@fst.tn",  password: "123456", role: "manager",    avatar: "LT" },
  { id: "d4", nom: "Admin FST",     email: "admin@fst.tn", password: "123456", role: "admin",      avatar: "AF" },
];

const ROLE_OPTIONS = [
  { value: "employee",   label: "Employé" },
  { value: "technician", label: "Technicien" },
  { value: "manager",    label: "Manager" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const N = 28;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * (W || 340), y: Math.random() * (H || 600),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.8,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - d / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} />
  );
}

function WrenchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

function AppLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 24 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 14px rgba(37,99,235,0.45)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{ color: "#fff", display: "flex", transform: "scale(0.82)" }}>
          <WrenchIcon />
        </div>
      </div>
      <div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "-0.4px", lineHeight: 1.1 }}>
          Fix<span style={{ color: "black" }}>Track</span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1, marginTop: 2 }}>
          Maintenance
        </div>
      </div>
    </div>
  );
}

// ── Modal Demande de Compte ───────────────────────────────────────────────────
function AccountRequestModal({ onClose }) {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", role: "employee", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: undefined }));
    setApiErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())   e.nom   = "Le nom est requis";
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format invalide";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiErr("");
    try {
      const res = await fetch(`${API_BASE}/account-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiErr(data.message || "Une erreur est survenue");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setApiErr("Impossible de contacter le serveur. Réessayez.");
    }
    setLoading(false);
  };

  const inputStyle = (err) => ({
    width: "100%", height: 42, padding: "0 14px",
    background: err ? "#fff5f5" : "#f9fafb",
    border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 9, fontSize: 13.5, color: "#111827",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  });

  const CSS = `
    @keyframes modalFade { from { opacity:0; transform:translateY(16px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ftSpin { to { transform:rotate(360deg); } }
    .req-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #f0f7ff !important; }
    .req-close:hover { background: #f3f4f6 !important; }
  `;

  return (
    <>
      <style>{CSS}</style>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 16px",
        }}
      >
        {/* Card — stop propagation to prevent close on card click */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480,
            background: "#fff", borderRadius: 18,
            boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
            overflow: "hidden",
            animation: "modalFade .35s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
            padding: "24px 28px 20px",
            position: "relative",
          }}>
            <button
              className="req-close"
              onClick={onClose}
              style={{
                position: "absolute", top: 14, right: 14,
                width: 30, height: 30, borderRadius: 8,
                border: "none", background: "rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
            <div style={{ fontSize: 28, marginBottom: 8 }}></div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>
              Demander un compte
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>
              Un administrateur recevra votre demande par email
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px 28px" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 8 }}>
                  Demande envoyée !
                </div>
                <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 20 }}>
                  Votre demande a bien été transmise à l'administrateur.<br />
                  Vous serez contacté à l'adresse <strong style={{ color: "#111827" }}>{form.email}</strong>.
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 28px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >Fermer</button>
              </div>
            ) : (
              <>
                {apiErr && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", marginBottom: 16,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 9, fontSize: 12.5, color: "#dc2626",
                  }}>
                    <span>⚠</span><span>{apiErr}</span>
                  </div>
                )}

                {/* Nom */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                    Nom complet <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="req-input"
                    placeholder="Prénom Nom"
                    value={form.nom}
                    onChange={set("nom")}
                    style={inputStyle(errors.nom)}
                  />
                  {errors.nom && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>↳ {errors.nom}</div>}
                </div>

                {/* Email */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                    Adresse email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="req-input"
                    type="email"
                    placeholder="prenom@entreprise.com"
                    value={form.email}
                    onChange={set("email")}
                    style={inputStyle(errors.email)}
                  />
                  {errors.email && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>↳ {errors.email}</div>}
                </div>

                {/* Téléphone + Rôle sur 2 colonnes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                      Téléphone
                    </label>
                    <input
                      className="req-input"
                      placeholder="+216 XX XXX XXX"
                      value={form.telephone}
                      onChange={set("telephone")}
                      style={inputStyle(false)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                      Rôle souhaité
                    </label>
                    <select
                      className="req-input"
                      value={form.role}
                      onChange={set("role")}
                      style={{
                        ...inputStyle(false),
                        cursor: "pointer",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        paddingRight: 32,
                      }}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                    Message (optionnel)
                  </label>
                  <textarea
                    className="req-input"
                    placeholder="Précisez votre service, poste ou toute information utile..."
                    value={form.message}
                    onChange={set("message")}
                    rows={3}
                    style={{
                      ...inputStyle(false),
                      height: "auto",
                      padding: "10px 14px",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%", height: 46,
                    background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer",
                    color: "#fff", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 800, letterSpacing: ".4px",
                    boxShadow: loading ? "none" : "0 4px 18px rgba(37,99,235,0.35)",
                    transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 7px 24px rgba(37,99,235,0.45)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(37,99,235,0.35)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                    {loading
                      ? <><div style={{ width: 17, height: 17, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ftSpin .65s linear infinite" }} /><span>Envoi en cours…</span></>
                      : <><span>📨</span><span>ENVOYER MA DEMANDE</span></>
                    }
                  </div>
                </button>

                <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
                  Votre demande sera examinée par un administrateur.<br />
                  Aucun compte n'est créé automatiquement.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LoginPage({ onLoginSuccess }) {
  const { loginWithBackend } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiErr,   setApiErr]   = useState("");
  const [errors,   setErrors]   = useState({});
  const [success,  setSuccess]  = useState(false);
  const [succUser, setSuccUser] = useState(null);
  const [time,     setTime]     = useState(new Date());

  // ── Modal état ────────────────────────────────────────────────────────────
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ts = time.toTimeString().slice(0, 8);

  const validate = useCallback(() => {
    const e = {};
    if (!email)                            e.email    = "L'adresse email est requise";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Format invalide";
    if (!password)                         e.password = "Le mot de passe est requis";
    else if (password.length < 6)          e.password = "Minimum 6 caractères";
    return e;
  }, [email, password]);

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setApiErr(""); setLoading(true);

    const result = await loginWithBackend({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (!result.success) {
      setApiErr(result.error || "Email ou mot de passe incorrect.");
      return;
    }

    setSuccUser(result.user);
    setSuccess(true);

    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(result.role);
      else window.location.href = `/${result.role}/dashboard`;
    }, 1500);
  };

  const fill = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setErrors({});
    setApiErr("");
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes ftSlide   { from { opacity:0; transform:translateY(24px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ftShake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(5px)} }
    @keyframes ftPop     { from{transform:scale(0.2);opacity:0} to{transform:scale(1);opacity:1} }
    @keyframes ftPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.6)} 60%{box-shadow:0 0 0 6px rgba(74,222,128,0)} }
    @keyframes ftShimmer { 0%{left:-120%} 100%{left:200%} }
    @keyframes ftSpin    { to{transform:rotate(360deg)} }
    .ft-demo:hover { background:rgba(255,255,255,0.13) !important; transform:translateX(3px); }
    .ft-req-btn:hover { background:rgba(255,255,255,0.18) !important; border-color:rgba(255,255,255,0.35) !important; }
    @media(max-width:920px){ .ft-card{grid-template-columns:1fr !important;} .ft-left{display:none !important;} .ft-right{padding:32px 22px !important; max-width:100% !important;} }
  `;

  return (
    <>
      <style>{CSS}</style>

      {/* Modal demande de compte */}
      {showRequestModal && (
        <AccountRequestModal onClose={() => setShowRequestModal(false)} />
      )}

      <div style={{
        minHeight: "100vh", width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        background: "linear-gradient(135deg, #1a3a6e 0%, #1e4080 50%, #2251a3 100%)",
        fontFamily: "'Outfit', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"fixed", top:"-20vh", right:"-10vw", width:"45vw", height:"45vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-18vh", left:"-8vw", width:"40vw", height:"40vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents:"none" }} />

        <div className="ft-card" style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 1100,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "ftSlide .55s cubic-bezier(.22,1,.36,1) both",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1565D8 0%, #0D47A1 100%)",
            minHeight: 580,
            padding: "40px 50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            position: "relative",
            overflow: "hidden",
          }}>
            <ParticleCanvas />

            <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", pointerEvents:"none", zIndex:1 }} />
            <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"250px", height:"250px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", pointerEvents:"none", zIndex:1 }} />

            {/* LEFT */}
            <div className="ft-left" style={{ flex: "0 0 auto", maxWidth: 380, position: "relative", zIndex: 2 }}>
              <AppLogo />

              <div style={{ color: "#fff", fontWeight: 800, fontSize: 26, lineHeight: 1.25, letterSpacing: "-0.4px", marginBottom: 10 }}>Bienvenue</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 400, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Plateforme intelligente de gestion des maintenances industrielles — tickets, techniciens & reporting.
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 6, marginBottom: 24 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "ftPulse 2.2s ease-in-out infinite" }} />
                Système actif · <strong style={{ fontFamily: "monospace", marginLeft: 3 }}>{ts}</strong>
              </div>

              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 8 }}>
                  Comptes démo — clic pour remplir
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {DEMO_ACCOUNTS.map(u => {
                    const rm = ROLE_META[u.role] || {};
                    return (
                      <div key={u.id} className="ft-demo" onClick={() => fill(u)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer", transition: "all .17s ease" }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{u.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nom}</div>
                          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{u.email}</div>
                        </div>
                        <div style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 20, flexShrink: 0, background: rm.bg, color: rm.color, border: `1px solid ${rm.border}`, letterSpacing: ".3px", textTransform: "uppercase" }}>{rm.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 7 }}>
                  MDP universel : <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontWeight: 600 }}>123456</span>
                </div>
              </div>

              {/* ── Bouton Demander un compte ── */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <button
                  className="ft-req-btn"
                  onClick={() => setShowRequestModal(true)}
                  style={{
                    width: "100%", padding: "10px 16px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10, cursor: "pointer",
                    color: "#fff", fontFamily: "inherit",
                    fontSize: 12.5, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .18s ease",
                  }}
                >
                  <span style={{ fontSize: 14 }}></span>
                  <span>Pas de compte ? Faire une demande</span>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>→</span>
                </button>
              </div>
            </div>

            {/* RIGHT — Formulaire */}
            <div className="ft-right" style={{ flex: 1, maxWidth: 480, background: "#fff", borderRadius: 16, padding: "32px 30px", boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)", position: "relative", zIndex: 2 }}>
              {success ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, animation: "ftSlide .45s cubic-bezier(.22,1,.36,1) both" }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", border: "2px solid #22c55e", background: "rgba(34,197,94,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, animation: "ftPop .5s cubic-bezier(.34,1.56,.64,1) both" }}>✓</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>Connexion réussie !</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                    Bienvenue, <strong style={{ color: "#111827" }}>{succUser?.nom}</strong><br />
                    Redirection en cours…
                  </div>
                  {succUser && (
                    <div style={{ padding: "4px 16px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", background: ROLE_META[succUser.role]?.bg, color: ROLE_META[succUser.role]?.color, border: `1px solid ${ROLE_META[succUser.role]?.border}` }}>
                      {ROLE_META[succUser.role]?.label}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4 }}>Connexion</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>Accès réservé aux membres de l'équipe.</div>
                  </div>

                  {apiErr && (
                    <div key={apiErr} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 18, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 12.5, color: "#dc2626", animation: "ftShake .35s ease" }}>
                      <span>⚠</span><span>{apiErr}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Adresse email</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none" }}>✉</span>
                      <input type="email" placeholder="prenom@fst.tn" value={email}
                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{ width: "100%", height: 44, paddingLeft: 38, paddingRight: 14, background: errors.email ? "#fff5f5" : "#f9fafb", border: `1.5px solid ${errors.email ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13.5, color: "#111827", outline: "none", fontFamily: "inherit", transition: "all .2s" }}
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "#f0f7ff"; }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = errors.email ? "#fff5f5" : "#f9fafb"; }}
                      />
                    </div>
                    {errors.email && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>↳ {errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Mot de passe</label>
                      <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2563eb", fontFamily: "inherit", padding: 0 }}>Mot de passe oublié ?</button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none" }}>🔒</span>
                      <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{ width: "100%", height: 44, paddingLeft: 38, paddingRight: 44, background: errors.password ? "#fff5f5" : "#f9fafb", border: `1.5px solid ${errors.password ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13.5, color: "#111827", outline: "none", fontFamily: "inherit", transition: "all .2s" }}
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "#f0f7ff"; }}
                        onBlur={e => { e.target.style.borderColor = errors.password ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = errors.password ? "#fff5f5" : "#f9fafb"; }}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 4 }}>{showPass ? "🙈" : "👁"}</button>
                    </div>
                    {errors.password && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>↳ {errors.password}</div>}
                  </div>

                  {/* Remember */}
                  <div onClick={() => setRemember(v => !v)} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20, cursor: "pointer" }}>
                    <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, border: remember ? "none" : "1.5px solid #d1d5db", background: remember ? "#2563eb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: remember ? "0 0 0 3px rgba(37,99,235,0.15)" : "none", transition: "all .15s" }}>
                      {remember && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12.5, color: "#6b7280", userSelect: "none" }}>Rester connecté pendant 30 jours</span>
                  </div>

                  {/* Submit */}
                  <button onClick={handleLogin} disabled={loading} style={{ width: "100%", height: 46, background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: ".4px", position: "relative", overflow: "hidden", boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.35)", transition: "transform .18s, box-shadow .18s", marginBottom: 16 }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.45)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.35)"; }}
                  >
                    {!loading && <div style={{ position: "absolute", top: 0, left: "-120%", width: "65%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)", animation: "ftShimmer 2.8s ease-in-out infinite" }} />}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, position: "relative", zIndex: 1 }}>
                      {loading
                        ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ftSpin .65s linear infinite" }} /><span>Vérification…</span></>
                        : <><span>SE CONNECTER</span><span style={{ fontSize: 16 }}>→</span></>
                      }
                    </div>
                  </button>

                  {/* ── Lien demande de compte (version mobile / formulaire côté droit) ── */}
                  <div
                    onClick={() => setShowRequestModal(true)}
                    style={{
                      padding: "11px 15px", background: "#eff6ff",
                      border: "1px solid #bfdbfe", borderRadius: 10,
                      fontSize: 12, color: "#1d4ed8", textAlign: "center",
                      lineHeight: 1.65, cursor: "pointer",
                      transition: "background .18s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}
                  >
                    Pas encore de compte ?{" "}
                    <strong style={{ color: "#111827", textDecoration: "underline" }}>
                      contactez l'administrateur
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, marginTop: 18, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: ".3px" }}>
          © 2026 FixTrack
        </div>
      </div>
    </>
  );
}