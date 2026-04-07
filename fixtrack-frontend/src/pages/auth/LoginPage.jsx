// src/pages/auth/LoginPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const ROLE_META = {
  user:       { label: "Utilisateur",  color: "#22c55e", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)"  },
  technician: { label: "Technicien",   color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  manager:    { label: "Manager",      color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
  admin:      { label: "Admin",        color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)"  },
};

const DEMO_ACCOUNTS = [
  { id: "d1", nom: "oumayma",    email: "oumayma.jendoubi06@gmail.com", password: "123456", role: "user",       avatar: "OJ" },
  { id: "d2", nom: "ola",        email: "olakhammassy@gmail.com",       password: "123456", role: "technician", avatar: "OK" },
  { id: "d3", nom: "chokri",     email: "maryemchaker@gmail.com",       password: "123456", role: "manager",    avatar: "MC" },
  { id: "d4", nom: "Admin FST",  email: "myriemkary3@gmail.com",        password: "123456", role: "admin",      avatar: "AF" },
];

const ROLE_OPTIONS = [
  { value: "user",       label: "Utilisateur" },
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

// ── Modal Demande de Compte — design professionnel sans emoji ─────────────────

function AccountRequestModal({ onClose }) {
  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", role: "user", message: "",
  });
  const [errors, setErrors]               = useState({});
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [apiErr, setApiErr]               = useState("");
  // ✅ NEW : validation domaine email en temps réel
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailDomainErr, setEmailDomainErr] = useState("");

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: undefined }));
    if (field === "email") setEmailDomainErr("");
    setApiErr("");
  };

  // ✅ NEW : vérifie le domaine à la perte de focus sur le champ email
  const checkEmailDomain = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setEmailChecking(true);
    setEmailDomainErr("");
    try {
      const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.valid) {
        setEmailDomainErr("Ce domaine email n'existe pas ou n'accepte pas d'emails.");
      }
    } catch {
      // silencieux si backend down
    } finally {
      setEmailChecking(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())   e.nom   = "Le nom est requis";
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format invalide";
    // ✅ Bloque le submit si le domaine est invalide
    if (emailDomainErr) e.email = emailDomainErr;
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // ✅ Bloque aussi si la vérification est encore en cours
    if (emailChecking) return;
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

  const inputStyle = (hasErr) => ({
    width: "100%", height: 42, padding: "0 14px",
    background: hasErr ? "#fff5f5" : "#f9fafb",
    border: `1.5px solid ${hasErr ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 8, fontSize: 13.5, color: "#111827",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
  });

  const CSS = `
    @keyframes modalFade { from { opacity:0; transform:translateY(12px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ftSpin { to { transform:rotate(360deg); } }
    .req-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; background: #f8faff !important; }
    .req-close:hover { background: rgba(255,255,255,0.25) !important; }
    .req-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4) !important; }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(6px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 16px",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 500, background: "#fff",
            borderRadius: 16,
            boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            animation: "modalFade .3s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
            padding: "28px 32px 24px", position: "relative",
          }}>
            <button className="req-close" onClick={onClose} style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: 8,
              border: "none", background: "rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", marginBottom: 4 }}>
              Demande d'accès
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              Votre demande sera transmise à l'administrateur
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#f0fdf4", border: "2px solid #86efac",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 8 }}>
                  Demande envoyée
                </div>
                <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
                  Votre demande a été transmise à l'administrateur.<br />
                  Vous serez contacté à <strong style={{ color: "#111827" }}>{form.email}</strong>.
                </div>
                <button onClick={onClose} style={{
                  padding: "10px 28px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  border: "none", borderRadius: 8, color: "#fff",
                  fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}>Fermer</button>
              </div>
            ) : (
              <>
                {apiErr && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px", marginBottom: 20,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 8, fontSize: 13, color: "#dc2626",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{apiErr}</span>
                  </div>
                )}

                {/* Nom */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Nom complet <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="req-input"
                    placeholder="Prénom Nom"
                    value={form.nom}
                    onChange={set("nom")}
                    style={inputStyle(errors.nom)}
                  />
                  {errors.nom && (
                    <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5 }}>{errors.nom}</div>
                  )}
                </div>

                {/* Email ✅ avec vérification domaine onBlur */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Adresse email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="req-input"
                      type="email"
                      placeholder="prenom@entreprise.com"
                      value={form.email}
                      onChange={set("email")}
                      onBlur={() => checkEmailDomain(form.email)}
                      style={inputStyle(errors.email || emailDomainErr)}
                    />
                    {/* Spinner pendant la vérification */}
                    {emailChecking && (
                      <div style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        width: 14, height: 14,
                        border: "2px solid #e5e7eb",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation: "ftSpin .65s linear infinite",
                      }} />
                    )}
                    {/* Checkmark si email valide */}
                    {!emailChecking && form.email && /\S+@\S+\.\S+/.test(form.email) && !emailDomainErr && (
                      <div style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)", color: "#16a34a",
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {(errors.email || emailDomainErr) && (
                    <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5 }}>
                      {errors.email || emailDomainErr}
                    </div>
                  )}
                </div>

                {/* Téléphone + Rôle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
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
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
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
                        paddingRight: 34,
                      }}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Message <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <textarea
                    className="req-input"
                    placeholder="Précisez votre service, poste ou toute information utile..."
                    value={form.message}
                    onChange={set("message")}
                    rows={3}
                    style={{ ...inputStyle(false), height: "auto", padding: "10px 14px", resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                {/* Submit */}
                <button
                  className="req-submit"
                  onClick={handleSubmit}
                  disabled={loading || emailChecking}
                  style={{
                    width: "100%", height: 44,
                    background: (loading || emailChecking) ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none", borderRadius: 9,
                    cursor: (loading || emailChecking) ? "not-allowed" : "pointer",
                    color: "#fff", fontFamily: "inherit",
                    fontSize: 13.5, fontWeight: 700,
                    boxShadow: (loading || emailChecking) ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                    transition: "transform .15s, box-shadow .15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {loading
                    ? <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ftSpin .65s linear infinite" }} />
                        <span>Envoi en cours...</span>
                      </>
                    : emailChecking
                      ? <span>Vérification email...</span>
                      : <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                          <span>Envoyer la demande</span>
                        </>
                  }
                </button>

                <p style={{ fontSize: 11.5, color: "#9ca3af", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                  Aucun compte ne sera créé sans validation de l'administrateur.
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

    const result = await loginWithBackend(
      email.trim().toLowerCase(),
      password
    );

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
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "ftSlide .55s cubic-bezier(.22,1,.36,1) both",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1565D8 0%, #0D47A1 100%)",
            minHeight: 580, padding: "40px 50px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 40, position: "relative", overflow: "hidden",
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
                        <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{u.avatar}</div>
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
                  Mot de passe universel : <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontWeight: 600 }}>123456</span>
                </div>
              </div>

              {/* Bouton Demander un compte */}
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>{apiErr}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Adresse email</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                      </span>
                      <input type="email" placeholder="prenom@exemple.com" value={email}
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
                      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{ width: "100%", height: 44, paddingLeft: 38, paddingRight: 44, background: errors.password ? "#fff5f5" : "#f9fafb", border: `1.5px solid ${errors.password ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13.5, color: "#111827", outline: "none", fontFamily: "inherit", transition: "all .2s" }}
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "#f0f7ff"; }}
                        onBlur={e => { e.target.style.borderColor = errors.password ? "#fca5a5" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = errors.password ? "#fff5f5" : "#f9fafb"; }}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 4 }}>
                        {showPass
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {errors.password && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>↳ {errors.password}</div>}
                  </div>

                  {/* Remember */}
                  <div onClick={() => setRemember(v => !v)} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20, cursor: "pointer" }}>
                    <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, border: remember ? "none" : "1.5px solid #d1d5db", background: remember ? "#2563eb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: remember ? "0 0 0 3px rgba(37,99,235,0.15)" : "none", transition: "all .15s" }}>
                      {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="1.5 6 4.5 9 10.5 3"/></svg>}
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
                        : <><span>Se connecter</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                      }
                    </div>
                  </button>

                  <div
                    onClick={() => setShowRequestModal(true)}
                    style={{
                      padding: "11px 15px", background: "#eff6ff",
                      border: "1px solid #bfdbfe", borderRadius: 10,
                      fontSize: 12, color: "#1d4ed8", textAlign: "center",
                      lineHeight: 1.65, cursor: "pointer", transition: "background .18s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}
                  >
                    Pas encore de compte ?{" "}
                    <strong style={{ color: "#111827", textDecoration: "underline" }}>
                      Contactez l'administrateur
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