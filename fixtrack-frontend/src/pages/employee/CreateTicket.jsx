// src/pages/employee/CreateTicket/CreateTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tickets } from "../../data/mockData";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { CSS }                                         from "./Wizardstyles";
import { STEPS, validateStep, Icon }                   from "./Wizardconstants";
import {
  MobileProgress,
  StepProbleme, StepLocalisation, StepUrgence,
  StepContact,  StepRecap,
} from "./Wizardsteps";

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

// ── AI Panel (placeholder — prêt pour le backend) ─────────────────────────────
function AIPanel({ form }) {
  // Heuristic score jusqu'à ce que le vrai modèle soit branché
  const hasContent = form.titre.length > 4 || form.description.length > 10;

  // Score simulé basé sur l'urgence choisie
  const scoreMap = { critical: 88, high: 65, medium: 42, low: 20 };
  const score    = scoreMap[form.urgence] || 42;
  const scoreColor =
    score >= 70 ? "#EF4444" :
    score >= 45 ? "#F97316" :
    score >= 25 ? "#F59E0B" : "#6B7280";

  const timeMap = {
    critical: "< 1 heure",
    high:     "2 – 4 heures",
    medium:   "1 – 2 jours",
    low:      "Cette semaine",
  };

  const priorityMap = {
    critical: { label: "CRITIQUE", bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
    high:     { label: "HAUTE",    bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    medium:   { label: "MOYENNE",  bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    low:      { label: "BASSE",    bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
  };
  const prio = priorityMap[form.urgence] || priorityMap.medium;

  const suggestions = {
    critical: "Signalez immédiatement à votre responsable. Le technicien sera prévenu en urgence.",
    high:     "Pensez à vérifier le disjoncteur ou les connexions locales avant l'arrivée du technicien.",
    medium:   "Notez l'heure d'apparition du problème pour faciliter le diagnostic.",
    low:      "Un technicien passera lors de sa prochaine tournée dans votre bâtiment.",
  };

  return (
    <div className="wz-ai-panel">

      {/* AI analysis card */}
      <div className="wz-ai-card">
        <div className="wz-ai-card-head">
          <div className="wz-ai-badge">
            <span className="wz-ai-badge-dot" />
            Analyse IA en direct
          </div>
        </div>

        {!hasContent ? (
          /* Placeholder tant que le formulaire est vide */
          <div className="wz-ai-placeholder">
            <div className="wz-ai-placeholder-ico">
              <IcoSparkle />
            </div>
            <p className="wz-ai-placeholder-text">
              Commencez à remplir le formulaire pour voir l'analyse en temps réel.
            </p>
          </div>
        ) : (
          <div className="wz-ai-card-body">

            {/* Priority + score */}
            <div className="wz-ai-priority-row">
              <span className="wz-ai-priority-label">Priorité estimée</span>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                background: prio.bg, color: prio.color, border: `1px solid ${prio.border}`,
                letterSpacing: "0.06em",
              }}>
                {prio.label}
              </span>
            </div>

            <div className="wz-ai-score">
              <span className="wz-ai-score-num" style={{ color: scoreColor }}>{score}</span>
              <span className="wz-ai-score-max">/ 100</span>
            </div>

            <div className="wz-ai-bar">
              <div className="wz-ai-bar-fill" style={{
                width: `${score}%`,
                background: score >= 70
                  ? "linear-gradient(90deg,#EF4444,#DC2626)"
                  : score >= 45
                  ? "linear-gradient(90deg,#F97316,#EA580C)"
                  : "linear-gradient(90deg,#F59E0B,#D97706)",
              }} />
            </div>

            {/* Metrics */}
            <div className="wz-ai-metrics">
              <div className="wz-ai-metric">
                <div className="wz-ai-metric-lbl">Temps d'intervention</div>
                <div className="wz-ai-metric-val">{timeMap[form.urgence]}</div>
              </div>
              <div className="wz-ai-metric">
                <div className="wz-ai-metric-lbl">Catégorie</div>
                <div className="wz-ai-metric-val" style={{ fontSize: 12 }}>
                  {form.categorie || "—"}
                </div>
              </div>
            </div>

            {/* Suggestion */}
            <div className="wz-ai-suggestion">
              <span className="wz-ai-suggestion-ico"><IcoPin /></span>
              <p className="wz-ai-suggestion-text">
                {suggestions[form.urgence]}
              </p>
            </div>
          </div>
        )}

        <div className="wz-ai-footer">
          <IcoInfo />
          {hasContent
            ? "Priorité calculée par IA — simulation locale"
            : "L'IA analysera votre demande en temps réel"}
        </div>
      </div>

      {/* Help card */}
      <div className="wz-help-card">
        <div className="wz-help-title">Besoin d'aide ?</div>
        <p className="wz-help-text">
          Consultez notre base de connaissances ou contactez le support technique interne.
        </p>
        <a href="#" className="wz-help-link">
          Accéder au centre d'aide <IcoExternal />
        </a>
      </div>

    </div>
  );
}

// ── Inline icons for AI panel ─────────────────────────────────────────────────
const IcoSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69H21l-4.94 3.58a1 1 0 0 0-.36 1.12L17.56 20 12 16.24 6.44 20l1.86-5.85a1 1 0 0 0-.36-1.12L3 9.45h6.17a1 1 0 0 0 .95-.69z"/>
  </svg>
);
const IcoPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcoExternal = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ navigate }) {
  return (
    <div className="wz">
      <style>{CSS}</style>
      <HorizontalStepper current={5} />
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px" }}>
        <div className="wz-main">
          <div className="wz-success">
            <div className="wz-success-ring"><Icon.CheckLg /></div>
            <h2 className="wz-success-title">Ticket soumis avec succès !</h2>
            <p className="wz-success-sub">
              Votre signalement a bien été enregistré.<br />
              Un technicien sera assigné dès que possible.
            </p>
            <div className="wz-status-pill">
              <span className="wz-status-dot" />
              Statut : Ouvert
            </div>
            <div style={{ marginTop: 28 }}>
              <button className="wz-nav-btn-next" onClick={() => navigate("/employee/tickets")}>
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
  const { user } = useAuth();

  const [step,     setStep]     = useState(0);
  const [dir,      setDir]      = useState("next");
  const [form,     setForm]     = useState({
    titre: "", description: "",
    localisation: "", categorie: "", categorieAutre: "",
    urgence: "medium",
    telephone: "", photos: [],
  });
  const [errors,   setErrors]   = useState({});
  const [focused,  setFocused]  = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

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
    await new Promise(r => setTimeout(r, 1200));
    const cat = form.categorie === "Autre"
      ? `Autre — ${form.categorieAutre.trim()}`
      : form.categorie;
    tickets.push({
      id:           `t${Date.now()}`,
      titre:         form.titre.trim(),
      description:   form.description.trim(),
      statut:        "open",
      priorite:      form.urgence,
      categorie:     cat,
      localisation:  form.localisation.trim(),
      auteurId:      user?.id || "u1",
      auteurTel:     form.telephone.trim() || null,
      technicienId:  null,
      dateCreation:  new Date().toISOString().split("T")[0],
      notes:         [],
    });
    setLoading(false);
    setSuccess(true);
  };

  const animCls   = dir === "next" ? "wz-step-anim" : "wz-step-anim-back";
  const stepProps = { form, errors, set, animCls };

  if (loading) return <LoadingSpinner size={48} />;
  if (success) return <SuccessScreen navigate={navigate} />;

  const renderStep = () => {
    switch (step) {
      case 0: return <StepProbleme    {...stepProps} />;
      case 1: return <StepLocalisation {...stepProps} showSugg={showSugg} setShowSugg={setShowSugg} />;
      case 2: return <StepUrgence     {...stepProps} />;
      case 3: return <StepContact     {...stepProps} focused={focused} setFocused={setFocused} user={user} />;
      case 4: return <StepRecap       {...stepProps} user={user} setStep={setStep} setDir={setDir} />;
      default: return null;
    }
  };

  return (
    <div className="wz">
      <style>{CSS}</style>

      {/* Horizontal stepper */}
      <HorizontalStepper current={step} />

      {/* 2-column layout */}
      <div className="wz-layout">

        {/* Left — form card */}
        <div className="wz-main">
          <MobileProgress current={step} />

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

        {/* Right — AI panel */}
        <AIPanel form={form} />

      </div>
    </div>
  );
}