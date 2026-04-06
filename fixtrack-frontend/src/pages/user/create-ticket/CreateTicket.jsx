// src/pages/user/create-ticket/CreateTicket.jsx
// Affiche la priorité finale IA (priorite + scoreIA) après soumission

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ticketService } from "../../../services/api";
import { AIPanel } from './AIPanel';
import SkeletonLoader from "../../../components/common/SkeletonLoader";

import { CSS }                                         from "./Wizardstyles";
import { STEPS, validateStep, Icon }                   from "./Wizardconstants";
import {
  MobileProgress,
  StepProbleme, StepLocalisation, StepUrgence,
  StepContact,  StepRecap,
} from "./Wizardsteps";

// ── Priority display config ───────────────────────────────────────────────────
const PRIO_CONFIG = {
  critical: { label: "Critique", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", pillBg: "#FEE2E2", pillColor: "#991B1B" },
  high:     { label: "Haute",    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", pillBg: "#FEF3C7", pillColor: "#92400E" },
  medium:   { label: "Moyenne",  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", pillBg: "#DBEAFE", pillColor: "#1E40AF" },
  low:      { label: "Basse",    color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF", pillBg: "#F3F4F6", pillColor: "#4B5563" },
};

const DELAI_MAP = {
  critical: "< 1 heure",
  high:     "2 – 4 heures",
  medium:   "1 – 2 jours",
  low:      "Cette semaine",
};

// ── Horizontal stepper ────────────────────────────────────────────────────────
function HorizontalStepper({ current }) {
  const currentStep = STEPS[current] || STEPS[STEPS.length - 1];
  return (
    <>
      <div className="wz-stepper">
        <div className="wz-stepper-inner">
          {STEPS.map((s, i) => {
            const st = s.id < current ? "done" : s.id === current ? "active" : "idle";
            return (
              <div key={s.id} className="wz-step-item">
                <div className="wz-step-btn">
                  <div className={`wz-step-circle ${st}`}>
                    {st === "done" ? <Icon.Check /> : s.id + 1}
                  </div>
                  <span className={`wz-step-name ${st}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`wz-step-connector${st === "done" ? " done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="wz-stepper-label">
        Étape <span>{Math.min(current + 1, STEPS.length)}</span> sur {STEPS.length} — {currentStep.label}
      </div>
    </>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
// Reçoit finalPriority (ex: "critical") et scoreIA (ex: 87) du backend
function SuccessScreen({ navigate, ticketId, finalPriority, scoreIA }) {
  const cfg = PRIO_CONFIG[finalPriority] || PRIO_CONFIG.medium;

  return (
    <div className="wz">
      <style>{CSS}</style>
      <HorizontalStepper current={5} />
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px" }}>
        <div className="wz-main">
          <div className="wz-success">

            {/* Checkmark */}
            <div className="wz-success-ring"><Icon.CheckLg /></div>
            <h2 className="wz-success-title">Ticket soumis avec succès !</h2>
            <p className="wz-success-sub">
              Votre signalement a bien été enregistré.<br />
              Un technicien sera assigné dès que possible.
            </p>

            {/* Statut ouvert */}
            <div className="wz-status-pill">
              <span className="wz-status-dot" />
              Statut : Ouvert
            </div>

            {/* ── Priorité finale IA ──────────────────────────────────────── */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              marginTop: 16,
              padding: "14px 22px",
              borderRadius: 16,
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
            }}>
              {/* Score circle */}
              <div style={{
                width: 52, height: 52,
                borderRadius: "50%",
                border: `2.5px solid ${cfg.border}`,
                background: "#fff",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                  {scoreIA ?? "—"}
                </span>
                <span style={{ fontSize: 9, color: "#9CA3AF" }}>/100</span>
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600, opacity: 0.75, marginBottom: 4 }}>
                  Priorité calculée par l'IA
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%",
                    backgroundColor: cfg.dot, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 16, fontWeight: 700,
                    color: cfg.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: cfg.pillColor, opacity: 0.85 }}>
                  Délai d'intervention estimé : <strong>{DELAI_MAP[finalPriority]}</strong>
                </div>
              </div>
            </div>

            {/* Référence */}
            {ticketId && (
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
                Référence : #{ticketId}
              </p>
            )}

            <div style={{ marginTop: 28 }}>
              <button className="wz-nav-btn-next" onClick={() => navigate("/user/tickets")}>
                Voir mes tickets <Icon.Next />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateTicket() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [step,     setStep]     = useState(0);
  const [dir,      setDir]      = useState("next");
  const [form,     setForm]     = useState({
    titre: "", description: "",
    localisation: "", categorie: "", categorieAutre: "",
    urgence: "medium",
    telephone: "", photos: [],
  });
  const [errors,       setErrors]       = useState({});
  const [focused,      setFocused]      = useState("");
  const [showSugg,     setShowSugg]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [apiError,     setApiError]     = useState("");
  const [createdId,    setCreatedId]    = useState(null);
  // Priorité finale + score retournés par le backend (calculatePriority)
  const [finalPriority, setFinalPriority] = useState("medium");
  const [scoreIA,       setScoreIA]       = useState(undefined);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDir("next");
    setStep(prev => prev + 1);
  };

  const goBack = () => { setDir("back"); setStep(prev => prev - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setApiError("");

    const cat = form.categorie === "Autre"
      ? `Autre — ${form.categorieAutre.trim()}`
      : form.categorie;

    try {
      const payload = {
        titre:           form.titre.trim(),
        description:     form.description.trim(),
        categorie:       cat,
        localisation:    form.localisation.trim(),
        urgence:         form.urgence,
        auteurTel:       form.telephone.trim() || null,
      };

      const ticket = await ticketService.create(payload);

      // Le backend retourne le ticket avec priorite et scoreIA calculés par l'IA
      setCreatedId(ticket._id);
      setFinalPriority(ticket.priorite || "medium");
      // Le controller stocke le score dans scoreIA (pas aiScore)
      setScoreIA(ticket.scoreIA ?? undefined);
      setSuccess(true);

    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || "Erreur lors de la soumission. Réessayez.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const animCls   = dir === "next" ? "wz-step-anim" : "wz-step-anim-back";
  const stepProps = { form, errors, set, animCls };

  if (loading) return <SkeletonLoader type="card" height={48} />;
  if (success)  return (
    <SuccessScreen
      navigate={navigate}
      ticketId={createdId}
      finalPriority={finalPriority}
      scoreIA={scoreIA}
    />
  );

  const renderStep = () => {
    switch (step) {
      case 0: return <StepProbleme     {...stepProps} />;
      case 1: return <StepLocalisation {...stepProps} showSugg={showSugg} setShowSugg={setShowSugg} />;
      case 2: return <StepUrgence      {...stepProps} />;
      case 3: return <StepContact      {...stepProps} focused={focused} setFocused={setFocused} user={user} />;
      case 4: return <StepRecap        {...stepProps} user={user} setStep={setStep} setDir={setDir} />;
      default: return null;
    }
  };

  return (
    <div className="wz">
      <style>{CSS}</style>
      <HorizontalStepper current={step} />
      <div className="wz-layout">
        <div className="wz-main">
          <MobileProgress current={step} />

          {apiError && (
            <div style={{
              padding: "10px 14px", marginBottom: 16,
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 10, fontSize: 13, color: "#DC2626",
            }}>
              ⚠ {apiError}
            </div>
          )}

          {renderStep()}

          <div className="wz-nav">
            {step > 0 ? (
              <button className="wz-nav-btn-back" onClick={goBack}>
                <Icon.Back /> Précédent
              </button>
            ) : (
              <button className="wz-nav-btn-back" onClick={() => navigate(-1)}>
                <Icon.Back /> Annuler
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button className="wz-nav-btn-next" onClick={goNext}>
                Suivant <Icon.Next />
              </button>
            ) : (
              <button className="wz-nav-btn-submit" onClick={handleSubmit}>
                <Icon.Check /> Soumettre le ticket
              </button>
            )}
          </div>
        </div>

        <AIPanel form={form} />
      </div>
    </div>
  );
}