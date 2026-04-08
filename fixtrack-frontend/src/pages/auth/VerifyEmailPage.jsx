// src/pages/auth/VerifyEmailPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailWithToken, resendEmailVerification, loading } = useAuth();

  const [status, setStatus] = useState("loading"); // loading, success, error, input
  const [message, setMessage] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // ✅ Defined BEFORE useEffect so it can be referenced
  const verifyToken = useCallback(async (token) => {
    setStatus("loading");
    const result = await verifyEmailWithToken(token);

    if (result.success) {
      setStatus("success");
      setMessage(result.message || "✅ Email vérifié avec succès!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      if (result.tokenExpired) {
        setMessage(
          "❌ Le lien de vérification a expiré. Demandez un nouveau lien ci-dessous."
        );
        setStatus("input");
      } else if (result.tokenInvalid) {
        setStatus("error");
        setMessage("❌ Le lien de vérification est invalide.");
      } else {
        setStatus("error");
        setMessage(result.error || "Erreur lors de la vérification.");
      }
    }
  }, [verifyEmailWithToken, navigate]);

  // ✅ useEffect comes AFTER verifyToken is declared
  useEffect(() => {
    const token = searchParams.get("token");
    // Defer state updates to avoid synchronous setState warning in strict mode
    const timer = setTimeout(() => {
      if (token) {
        verifyToken(token);
      } else {
        setStatus("input");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams, verifyToken]);

  const handleManualVerify = async () => {
    if (!manualToken.trim()) {
      setMessage("Veuillez entrer le code de vérification");
      return;
    }
    await verifyToken(manualToken);
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setResendMessage("Veuillez entrer votre adresse email");
      return;
    }

    setResending(true);
    const result = await resendEmailVerification(email);

    if (result.success) {
      setResendMessage("✅ Email de vérification renvoyé! Vérifiez votre boîte.");
      setEmail("");
      setTimeout(() => setResendMessage(""), 5000);
    } else {
      if (result.rateLimited) {
        setResendMessage(
          "⏱️  Trop de tentatives. Attendez 5 minutes avant de réessayer."
        );
      } else if (result.alreadyVerified) {
        setResendMessage(
          "✅ Cet email est déjà vérifié. Vous pouvez vous connecter."
        );
      } else {
        setResendMessage(result.error || "Erreur lors du renvoi");
      }
    }
    setResending(false);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Outfit', sans-serif; margin: 0; padding: 0; }
    input, button { font-family: 'Outfit', sans-serif; }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a3a6e 0%, #1e4080 50%, #2251a3 100%)",
          padding: "20px 16px",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {status === "success" ? "✅" : "📧"}
            </div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              Vérification d'email
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13.5 }}>
              Finalisez votre inscription
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px" }}>
            {status === "loading" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "3px solid #e5e7eb",
                    borderTopColor: "#2563eb",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div style={{ color: "#6b7280" }}>Vérification en cours...</div>
              </div>
            )}

            {status === "success" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {message}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 16 }}>
                  Redirection vers la connexion...
                </div>
              </div>
            )}

            {status === "input" && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Entrez votre code de vérification
                  </div>
                  <input
                    type="text"
                    placeholder="Code à 64 caractères ou lien d'email..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      fontSize: 13.5,
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 9,
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {message && (
                    <div
                      style={{
                        fontSize: 12,
                        color: message.includes("❌") ? "#dc2626" : "#059669",
                        marginTop: 8,
                      }}
                    >
                      {message}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManualVerify}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: loading
                      ? "#93c5fd"
                      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: 16,
                  }}
                >
                  {loading ? "Vérification..." : "Vérifier mon email"}
                </button>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Vous n'avez pas reçu le code?
                  </div>
                  <input
                    type="email"
                    placeholder="prenom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      fontSize: 13.5,
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 9,
                      boxSizing: "border-box",
                      outline: "none",
                      marginBottom: 12,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={handleResend}
                    disabled={resending || loading}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: resending || loading ? "#f3f4f6" : "#ffffff",
                      border: "1.5px solid #2563eb",
                      borderRadius: 10,
                      color: "#2563eb",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: resending || loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {resending ? "Envoi..." : "Renvoyer le code"}
                  </button>
                  {resendMessage && (
                    <div
                      style={{
                        fontSize: 12,
                        color: resendMessage.includes("❌") ? "#dc2626" : "#059669",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      {resendMessage}
                    </div>
                  )}
                </div>
              </>
            )}

            {status === "error" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                <div style={{ fontSize: 14, color: "#dc2626", marginBottom: 24 }}>
                  {message}
                </div>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "10px 28px",
                    background: "#2563eb",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Retour à la connexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}