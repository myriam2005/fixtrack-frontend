// src/pages/auth/LoginPage.jsx
// ✅ VERSION BACKEND RÉEL — même design, authentification via API

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const ROLE_META = {
  employee:   { label: "Employé",    color: "#22c55e", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)"  },
  technician: { label: "Technicien", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  manager:    { label: "Manager",    color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
  admin:      { label: "Admin",      color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)"  },
};

// Comptes démo affichés dans le panneau gauche (pour faciliter les tests)
const DEMO_ACCOUNTS = [
  { id: "d1", nom: "Jean Dupont",   email: "jean@fst.tn",  password: "123456", role: "employee",   avatar: "JD" },
  { id: "d2", nom: "Sara Ben Ali",  email: "sara@fst.tn",  password: "123456", role: "technician", avatar: "SB" },
  { id: "d3", nom: "Lina Trabelsi", email: "lina@fst.tn",  password: "123456", role: "manager",    avatar: "LT" },
  { id: "d4", nom: "Admin FST",     email: "admin@fst.tn", password: "123456", role: "admin",      avatar: "AF" },
];

// ── Subtle particle canvas ────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LoginPage({ onLoginSuccess }) {
  // ✅ On utilise loginWithBackend au lieu de login directement
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

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ts = time.toTimeString().slice(0, 8);

  const validate = useCallback(() => {
    const e = {};
    if (!email)                             e.email    = "L'adresse email est requise";
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = "Format invalide";
    if (!password)                          e.password = "Le mot de passe est requis";
    else if (password.length < 6)           e.password = "Minimum 6 caractères";
    return e;
  }, [email, password]);

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setApiErr(""); setLoading(true);

    // ✅ Appel réel vers le backend
    const result = await loginWithBackend({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (!result.success) {
      setApiErr(result.error || "Email ou mot de passe incorrect.");
      return;
    }

    // ✅ Succès — result.user contient { id, nom, email, role, avatar, token }
    setSuccUser(result.user);
    setSuccess(true);

    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(result.role);
      else window.location.href = `/${result.role}/dashboard`;
    }, 1500);
  };

  // Remplit les champs avec un compte démo (le vrai appel API sera quand même fait)
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
    @media(max-width:920px){ .ft-card{grid-template-columns:1fr !important;} .ft-left{display:none !important;} .ft-right{padding:32px 22px !important; max-width:100% !important;} }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        background: "linear-gradient(135deg, #1a3a6e 0%, #1e4080 50%, #2251a3 100%)",
        fontFamily: "'Outfit', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow blobs */}
        <div style={{ position:"fixed", top:"-20vh", right:"-10vw", width:"45vw", height:"45vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-18vh", left:"-8vw",  width:"40vw", height:"40vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents:"none" }} />

        {/* ── Card */}
        <div className="ft-card" style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 1100,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "ftSlide .55s cubic-bezier(.22,1,.36,1) both",
        }}>

          {/* ══ FOND BLEU UNIQUE ══ */}
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

            {/* Cercles déco */}
            <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", pointerEvents:"none", zIndex:1 }} />
            <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"250px", height:"250px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", pointerEvents:"none", zIndex:1 }} />

            {/* ══ LEFT — Section WELCOME ══ */}
            <div className="ft-left" style={{
              flex: "0 0 auto",
              maxWidth: 380,
              position: "relative",
              zIndex: 2,
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 24 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                }}>🔧</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px" }}>FixTrack</div>
                </div>
              </div>

              {/* Headline */}
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 26, lineHeight: 1.25, letterSpacing: "-0.4px", marginBottom: 10 }}>
                Bienvenue
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 400, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Plateforme intelligente de gestion des maintenances industrielles — tickets, techniciens & reporting.
              </div>

              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20,
                fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 6, marginBottom: 24,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "ftPulse 2.2s ease-in-out infinite" }} />
                Système actif · <strong style={{ fontFamily: "monospace", marginLeft: 3 }}>{ts}</strong>
              </div>

              {/* Demo accounts */}
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 8 }}>
                  Comptes démo — clic pour remplir
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {DEMO_ACCOUNTS.map(u => {
                    const rm = ROLE_META[u.role] || {};
                    return (
                      <div key={u.id} className="ft-demo" onClick={() => fill(u)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 9px",
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                        cursor: "pointer", transition: "all .17s ease",
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                          background: "rgba(255,255,255,0.14)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                        }}>{u.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nom}</div>
                          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{u.email}</div>
                        </div>
                        <div style={{
                          fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 20, flexShrink: 0,
                          background: rm.bg, color: rm.color, border: `1px solid ${rm.border}`,
                          letterSpacing: ".3px", textTransform: "uppercase",
                        }}>{rm.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 7 }}>
                  MDP universel : <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontWeight: 600 }}>123456</span>
                </div>
              </div>
            </div>

            {/* ══ RIGHT — Carte blanche formulaire ══ */}
            <div className="ft-right" style={{
              flex: 1,
              maxWidth: 480,
              background: "#fff",
              borderRadius: 16,
              padding: "32px 30px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
              position: "relative",
              zIndex: 2,
            }}>
              {success ? (
                /* ── Écran succès ── */
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, animation: "ftSlide .45s cubic-bezier(.22,1,.36,1) both" }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: "50%",
                    border: "2px solid #22c55e", background: "rgba(34,197,94,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, animation: "ftPop .5s cubic-bezier(.34,1.56,.64,1) both",
                  }}>✓</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>Connexion réussie !</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                    Bienvenue, <strong style={{ color: "#111827" }}>{succUser?.nom}</strong><br />
                    Redirection en cours…
                  </div>
                  {succUser && (
                    <div style={{
                      padding: "4px 16px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                      letterSpacing: ".4px", textTransform: "uppercase",
                      background: ROLE_META[succUser.role]?.bg,
                      color: ROLE_META[succUser.role]?.color,
                      border: `1px solid ${ROLE_META[succUser.role]?.border}`,
                    }}>{ROLE_META[succUser.role]?.label}</div>
                  )}
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4 }}>
                      Connexion
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>Accès réservé aux membres de l'équipe.</div>
                  </div>

                  {/* Error */}
                  {apiErr && (
                    <div key={apiErr} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 14px", marginBottom: 18,
                      background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
                      fontSize: 12.5, color: "#dc2626", animation: "ftShake .35s ease",
                    }}>
                      <span>⚠</span><span>{apiErr}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                      Adresse email
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none" }}>✉</span>
                      <input
                        type="email" placeholder="prenom@fst.tn" value={email}
                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{
                          width: "100%", height: 44, paddingLeft: 38, paddingRight: 14,
                          background: errors.email ? "#fff5f5" : "#f9fafb",
                          border: `1.5px solid ${errors.email ? "#fca5a5" : "#e5e7eb"}`,
                          borderRadius: 10, fontSize: 13.5, color: "#111827", outline: "none",
                          fontFamily: "inherit", transition: "all .2s",
                        }}
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
                      <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2563eb", fontFamily: "inherit", padding: 0 }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none" }}>🔒</span>
                      <input
                        type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{
                          width: "100%", height: 44, paddingLeft: 38, paddingRight: 44,
                          background: errors.password ? "#fff5f5" : "#f9fafb",
                          border: `1.5px solid ${errors.password ? "#fca5a5" : "#e5e7eb"}`,
                          borderRadius: 10, fontSize: 13.5, color: "#111827", outline: "none",
                          fontFamily: "inherit", transition: "all .2s",
                        }}
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "#f0f7ff"; }}
                        onBlur={e => { e.target.style.borderColor = errors.password ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = errors.password ? "#fff5f5" : "#f9fafb"; }}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 4,
                      }}>{showPass ? "🙈" : "👁"}</button>
                    </div>
                    {errors.password && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>↳ {errors.password}</div>}
                  </div>

                  {/* Remember */}
                  <div onClick={() => setRemember(v => !v)} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20, cursor: "pointer" }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                      border: remember ? "none" : "1.5px solid #d1d5db",
                      background: remember ? "#2563eb" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: remember ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
                      transition: "all .15s",
                    }}>
                      {remember && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12.5, color: "#6b7280", userSelect: "none" }}>Rester connecté pendant 30 jours</span>
                  </div>

                  {/* Submit */}
                  <button onClick={handleLogin} disabled={loading} style={{
                    width: "100%", height: 46,
                    background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer",
                    color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800,
                    letterSpacing: ".4px", position: "relative", overflow: "hidden",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.35)",
                    transition: "transform .18s, box-shadow .18s",
                    marginBottom: 16,
                  }}
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

                  {/* No account note */}
                  <div style={{
                    padding: "11px 15px",
                    background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
                    fontSize: 12, color: "#1d4ed8", textAlign: "center", lineHeight: 1.65,
                  }}>
                    Pas encore de compte ?{" "}
                    <strong style={{ color: "#111827" }}>Contactez votre administrateur.</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 10, marginTop: 18, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: ".3px" }}>
          © 2025 FixTrack
        </div>
      </div>
    </>
  );
}