// src/pages/auth/LoginPage.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { users } from "../../data/mockData";

const ROLE_META = {
  employee:   { label: "Employé",    color: "#22c55e", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)"  },
  technician: { label: "Technicien", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  manager:    { label: "Manager",    color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
  admin:      { label: "Admin",      color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)"  },
};

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
  const { login } = useAuth();

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
    await new Promise(r => setTimeout(r, 1300));
    setLoading(false);
    const acc = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!acc) { setApiErr("Email ou mot de passe incorrect."); return; }
    setSuccUser(acc);
    setSuccess(true);
    login({ id: acc.id, name: acc.nom, role: acc.role, email: acc.email, avatar: acc.avatar });
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(acc.role);
      else window.location.href = `/${acc.role}/dashboard`;
    }, 1500);
  };

  const fill = (u) => { setEmail(u.email); setPassword(u.password); setErrors({}); setApiErr(""); };

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
    @media(max-width:680px){ .ft-card{grid-template-columns:1fr !important;} .ft-left{display:none !important;} .ft-right{padding:32px 22px !important;} }
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
          width: "100%", maxWidth: 860,
          display: "grid", gridTemplateColumns: "310px 1fr",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "ftSlide .55s cubic-bezier(.22,1,.36,1) both",
        }}>

          {/* ══ LEFT ══ */}
          <div className="ft-left" style={{
            background: "linear-gradient(160deg, #1e40af 0%, #2563eb 100%)",
            padding: "36px 26px 30px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            <ParticleCanvas />

            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 32 }}>
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
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.4px", marginBottom: 10 }}>
                Bienvenue sur<br />
                <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, fontSize: 15 }}> Plateforme intelligente de gestion des maintenances industrielles — tickets, techniciens & reporting.</span>
              </div>

              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20,
                fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 6,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "ftPulse 2.2s ease-in-out infinite" }} />
                Système actif · <strong style={{ fontFamily: "monospace", marginLeft: 3 }}>{ts}</strong>
              </div>
            </div>

            {/* Demo accounts */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 9 }}>
                Comptes démo — clic pour remplir
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {users.map(u => {
                  const rm = ROLE_META[u.role] || {};
                  return (
                    <div key={u.id} className="ft-demo" onClick={() => fill(u)} style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9,
                      cursor: "pointer", transition: "all .17s ease",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: "rgba(255,255,255,0.14)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                      }}>{u.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nom}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{u.email}</div>
                      </div>
                      <div style={{
                        fontSize: 8.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
                        background: rm.bg, color: rm.color, border: `1px solid ${rm.border}`,
                        letterSpacing: ".3px", textTransform: "uppercase",
                      }}>{rm.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 8 }}>
                MDP universel : <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontWeight: 600 }}>123456</span>
              </div>
            </div>
          </div>

          {/* ══ RIGHT ══ */}
          <div className="ft-right" style={{
            background: "#fff",
            padding: "48px 44px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            position: "relative",
          }}>
            {success ? (
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
                <div style={{ marginBottom: 30 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 5 }}>
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
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                    Adresse email
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none" }}>✉</span>
                    <input
                      type="email" placeholder="prenom@fst.tn" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      style={{
                        width: "100%", height: 46, paddingLeft: 38, paddingRight: 14,
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
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
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
                        width: "100%", height: 46, paddingLeft: 38, paddingRight: 44,
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
                <div onClick={() => setRemember(v => !v)} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 24, cursor: "pointer" }}>
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
                  width: "100%", height: 48,
                  background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer",
                  color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800,
                  letterSpacing: ".4px", position: "relative", overflow: "hidden",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.35)",
                  transition: "transform .18s, box-shadow .18s",
                  marginBottom: 20,
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
                  <strong style={{ color: "#111827" }}><a href="mailto:admin@fixtrack.com">Contactez votre administrateur.</a></strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 10, marginTop: 18, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: ".3px" }}>
          © 2025 FixTrack · FST Tunis
        </div>
      </div>
    </>
  );
}