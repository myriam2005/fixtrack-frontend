// src/pages/auth/ResetPasswordPage.jsx
// Route : /reset-password?token=xxxxx
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function WrenchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [token,       setToken]       = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) setError("Lien invalide. Aucun token trouvé.");
    else setToken(t);
  }, []);

  // Indicateur de force du mot de passe
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#e5e7eb" };
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: "Faible",  color: "#ef4444" };
    if (score <= 3) return { score, label: "Moyen",   color: "#f59e0b" };
    return               { score, label: "Fort",    color: "#22c55e" };
  };

  const strength = getStrength(password);

  const handleSubmit = async () => {
    setError("");
    if (!password || password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Token manquant. Veuillez refaire la demande.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur lors de la réinitialisation.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    }
    setLoading(false);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes ftSlide  { from { opacity:0; transform:translateY(20px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ftSpin   { to { transform:rotate(360deg); } }
    @keyframes ftPop    { from { transform:scale(0.2); opacity:0; } to { transform:scale(1); opacity:1; } }
    @keyframes ftPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.5)} 60%{box-shadow:0 0 0 6px rgba(245,158,11,0)} }
    .rp-input:focus { border-color:#f59e0b !important; box-shadow:0 0 0 3px rgba(245,158,11,0.12) !important; background:#fffbeb !important; }
    .rp-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(245,158,11,0.45) !important; }
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
      }}>
        {/* Décoration fond */}
        <div style={{ position:"fixed", top:"-20vh", right:"-10vw", width:"45vw", height:"45vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-18vh", left:"-8vw", width:"40vw", height:"40vw", borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents:"none" }} />

        {/* Card */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 440,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          animation: "ftSlide .55s cubic-bezier(.22,1,.36,1) both",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            padding: "28px 32px 24px",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ color: "#fff", transform: "scale(0.78)" }}><WrenchIcon /></div>
              </div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>
                Fix<span style={{ color: "rgba(255,255,255,0.6)" }}>Track</span>
              </div>
            </div>

            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", marginBottom: 3 }}>
              Nouveau mot de passe
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>
              Choisissez un mot de passe sécurisé pour votre compte.
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "#f0fdf4", border: "2px solid #86efac",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px",
                  animation: "ftPop .5s cubic-bezier(.34,1.56,.64,1) both",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 8 }}>
                  Mot de passe mis à jour !
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </div>
                <a
                  href="/login"
                  style={{
                    display: "inline-block",
                    padding: "10px 28px",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    border: "none", borderRadius: 8,
                    color: "#fff", fontFamily: "inherit",
                    fontSize: 13.5, fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                  }}
                >
                  Aller à la connexion →
                </a>
              </div>
            ) : (
              <>
                {/* Token invalide dès le chargement */}
                {!token && error ? (
                  <div style={{
                    textAlign: "center", padding: "12px 0",
                  }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: "50%",
                      background: "#fef2f2", border: "2px solid #fecaca",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>Lien invalide</div>
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 20 }}>{error}</div>
                    <a href="/login" style={{ color: "#2563eb", fontSize: 13, fontWeight: 600 }}>← Retour à la connexion</a>
                  </div>
                ) : (
                  <>
                    {/* Erreur API */}
                    {error && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "10px 13px", marginBottom: 18,
                        background: "#fef2f2", border: "1px solid #fecaca",
                        borderRadius: 8, fontSize: 12.5, color: "#dc2626",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Nouveau mot de passe */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                        Nouveau mot de passe <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input
                          className="rp-input"
                          type={showPass ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError(""); }}
                          style={{
                            width: "100%", height: 42,
                            paddingLeft: 36, paddingRight: 40,
                            background: "#f9fafb",
                            border: "1.5px solid #e5e7eb",
                            borderRadius: 8, fontSize: 13.5, color: "#111827",
                            outline: "none", fontFamily: "inherit",
                            transition: "border-color .15s, box-shadow .15s",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(v => !v)}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                        >
                          {showPass
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                      </div>

                      {/* Barre de force */}
                      {password && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                            {[1,2,3,4,5].map(i => (
                              <div key={i} style={{
                                flex: 1, height: 3, borderRadius: 99,
                                background: i <= strength.score ? strength.color : "#e5e7eb",
                                transition: "background .2s",
                              }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                            {strength.label}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirmation */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                        Confirmer le mot de passe <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input
                          className="rp-input"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirm}
                          onChange={e => { setConfirm(e.target.value); setError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleSubmit()}
                          style={{
                            width: "100%", height: 42,
                            paddingLeft: 36, paddingRight: 40,
                            background: confirm && confirm !== password ? "#fff5f5" : "#f9fafb",
                            border: `1.5px solid ${confirm && confirm !== password ? "#fca5a5" : "#e5e7eb"}`,
                            borderRadius: 8, fontSize: 13.5, color: "#111827",
                            outline: "none", fontFamily: "inherit",
                            transition: "border-color .15s, box-shadow .15s",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                        >
                          {showConfirm
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                        {/* Checkmark si les deux correspondent */}
                        {confirm && confirm === password && (
                          <div style={{ position: "absolute", right: 34, top: "50%", transform: "translateY(-50%)", color: "#16a34a" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      {confirm && confirm !== password && (
                        <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5 }}>
                          Les mots de passe ne correspondent pas
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      className="rp-btn"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        width: "100%", height: 44,
                        background: loading
                          ? "#fcd34d"
                          : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        border: "none", borderRadius: 9,
                        cursor: loading ? "not-allowed" : "pointer",
                        color: "#fff", fontFamily: "inherit",
                        fontSize: 13.5, fontWeight: 700,
                        boxShadow: loading ? "none" : "0 4px 14px rgba(245,158,11,0.35)",
                        transition: "transform .15s, box-shadow .15s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ftSpin .65s linear infinite" }} />
                          <span>Mise à jour...</span>
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          <span>Enregistrer le mot de passe</span>
                        </>
                      )}
                    </button>

                    <p style={{ fontSize: 11.5, color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
                      <a href="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                        ← Retour à la connexion
                      </a>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, marginTop: 18, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: ".3px" }}>
          © 2026 FixTrack
        </div>
      </div>
    </>
  );
}