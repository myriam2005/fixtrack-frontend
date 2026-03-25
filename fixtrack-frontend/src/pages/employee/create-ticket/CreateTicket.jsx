// src/pages/employee/CreateTicket/CreateTicket.jsx
// ✅ VERSION BACKEND — IA dynamique avec analyse réelle

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ticketService } from "../../../services/api";

import LoadingSpinner from "../../../components/common/LoadingSpinner";

import { CSS } from "./Wizardstyles";
import { STEPS, validateStep, Icon } from "./Wizardconstants";
import {
  MobileProgress,
  StepProbleme,
  StepLocalisation,
  StepUrgence,
  StepContact,
  StepRecap,
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

// ── Icônes ────────────────────────────────────────────────────────────────────
const IcoSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69H21l-4.94 3.58a1 1 0 0 0-.36 1.12L17.56 20 12 16.24 6.44 20l1.86-5.85a1 1 0 0 0-.36-1.12L3 9.45h6.17a1 1 0 0 0 .95-.69z" />
  </svg>
);
const IcoPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IcoInfo = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IcoExternal = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IcoLoading = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ── AI Panel avec analyse dynamique ───────────────────────────────────────────
function AIPanel({ form }) {
  const [iaScore, setIaScore] = useState(42);
  const [iaPriority, setIaPriority] = useState("medium");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const analysisTimeout = useRef(null);

  const hasContent = form.titre.length > 4 || form.description.length > 10;

  // Fonction d'analyse IA locale (ne dépend pas du backend)
  const analyzeLocally = useCallback(() => {
    let score = 0;
    const text = (form.titre + " " + form.description).toLowerCase();
    const locLower = form.localisation.toLowerCase();
    const catLower = (form.categorie === "Autre" ? form.categorieAutre : form.categorie || "").toLowerCase();

    // 1. Mots-clés critiques (+40)
    const criticalKeywords = [
      "incendie", "feu", "fumée", "fuite gaz", "gaz", "explosion",
      "électrocution", "blessé", "accident", "coincé", "bloqué",
      "danger", "urgence", "immédiat", "critique", "panne totale",
      "arrêt complet", "plus rien"
    ];
    if (criticalKeywords.some(kw => text.includes(kw))) {
      score += 40;
    }

    // 2. Mots-clés haute priorité (+20)
    const highKeywords = [
      "panne", "arrêt", "ne fonctionne pas", "urgent", "important",
      "rapidement", "aujourd'hui"
    ];
    if (highKeywords.some(kw => text.includes(kw))) {
      score += 20;
    }

    // 3. Catégories critiques (+30)
    const criticalCategories = ["sécurité", "électrique", "incendie", "gaz", "ascenseur"];
    if (criticalCategories.some(cat => catLower.includes(cat))) {
      score += 30;
    }

    // 4. Localisation importante (+20)
    const importantLocations = [
      "amphi", "salle", "classe", "labo", "bibliothèque",
      "réfectoire", "cantine", "accueil", "bureau", "cuisine",
      "open space", "hall", "lobby"
    ];
    if (importantLocations.some(loc => locLower.includes(loc))) {
      score += 20;
    }

    // 5. Urgence sélectionnée
    const urgencyBonus = { critical: 25, high: 15, medium: 8, low: 2 };
    score += urgencyBonus[form.urgence] || 0;

    // 6. Limiter et normaliser
    score = Math.min(100, Math.max(0, score));

    // Déterminer priorité
    let priorite = "medium";
    if (score >= 80) priorite = "critical";
    else if (score >= 60) priorite = "high";
    else if (score >= 35) priorite = "medium";
    else priorite = "low";

    setIaScore(score);
    setIaPriority(priorite);
  }, [form.titre, form.description, form.localisation, form.categorie, form.categorieAutre, form.urgence]);

  // Déclencher l'analyse après un délai (debounce)
  useEffect(() => {
    if (analysisTimeout.current) clearTimeout(analysisTimeout.current);
    analysisTimeout.current = setTimeout(() => {
      if (hasContent) {
        setAnalyzing(true);
        setAnalysisError(false);
        analyzeLocally();
        setAnalyzing(false);
      }
    }, 600);
    return () => {
      if (analysisTimeout.current) clearTimeout(analysisTimeout.current);
    };
  }, [form.titre, form.description, form.localisation, form.categorie, form.categorieAutre, form.urgence, hasContent, analyzeLocally]);

  const score = iaScore;
  const scoreColor = score >= 70 ? "#EF4444" : score >= 45 ? "#F97316" : score >= 25 ? "#F59E0B" : "#6B7280";

  const timeMap = {
    critical: "< 1 heure",
    high: "2 – 4 heures",
    medium: "1 – 2 jours",
    low: "Cette semaine",
  };

  const priorityMap = {
    critical: { label: "CRITIQUE", bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
    high: { label: "HAUTE", bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    medium: { label: "MOYENNE", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    low: { label: "BASSE", bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
  };

  const prio = priorityMap[iaPriority] || priorityMap.medium;

  const suggestions = {
    critical: "⚠️ URGENCE ABSOLUE ! Signalez immédiatement à votre responsable. Le technicien sera prévenu en urgence.",
    high: "🚨 Intervention rapide requise. Pensez à vérifier le disjoncteur ou les connexions locales avant l'arrivée du technicien.",
    medium: "📋 À traiter prochainement. Notez l'heure d'apparition du problème pour faciliter le diagnostic.",
    low: "🔧 Intervention programmée. Un technicien passera lors de sa prochaine tournée dans votre bâtiment.",
  };

  return (
    <div className="wz-ai-panel">
      <div className="wz-ai-card">
        <div className="wz-ai-card-head">
          <div className="wz-ai-badge">
            <span className="wz-ai-badge-dot" style={{ background: analyzing ? "#F59E0B" : "#6366F1" }} />
            Analyse IA {analyzing && "(calcul...)"}
          </div>
        </div>

        {!hasContent ? (
          <div className="wz-ai-placeholder">
            <div className="wz-ai-placeholder-ico"><IcoSparkle /></div>
            <p className="wz-ai-placeholder-text">
              Commencez à remplir le formulaire pour voir l'analyse en temps réel.
            </p>
          </div>
        ) : (
          <div className="wz-ai-card-body">
            <div className="wz-ai-priority-row">
              <span className="wz-ai-priority-label">Priorité estimée</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: prio.bg, color: prio.color, border: `1px solid ${prio.border}`, letterSpacing: "0.06em" }}>
                {prio.label}
              </span>
            </div>
            <div className="wz-ai-score">
              <span className="wz-ai-score-num" style={{ color: scoreColor }}>
                {analyzing ? "..." : score}
              </span>
              <span className="wz-ai-score-max">/ 100</span>
              {analyzing && (
                <span style={{ marginLeft: 8, fontSize: 10, color: "#F59E0B" }}>
                  <IcoLoading /> analyse...
                </span>
              )}
            </div>
            <div className="wz-ai-bar">
              <div className="wz-ai-bar-fill" style={{
                width: analyzing ? "50%" : `${score}%`,
                background: score >= 70 ? "linear-gradient(90deg,#EF4444,#DC2626)" : score >= 45 ? "linear-gradient(90deg,#F97316,#EA580C)" : "linear-gradient(90deg,#F59E0B,#D97706)",
                transition: "width 0.3s ease",
              }} />
            </div>
            <div className="wz-ai-metrics">
              <div className="wz-ai-metric">
                <div className="wz-ai-metric-lbl">Temps d'intervention</div>
                <div className="wz-ai-metric-val">{timeMap[iaPriority]}</div>
              </div>
              <div className="wz-ai-metric">
                <div className="wz-ai-metric-lbl">Catégorie</div>
                <div className="wz-ai-metric-val" style={{ fontSize: 12 }}>{form.categorie || "—"}</div>
              </div>
            </div>
            <div className="wz-ai-suggestion">
              <span className="wz-ai-suggestion-ico"><IcoPin /></span>
              <p className="wz-ai-suggestion-text">{suggestions[iaPriority]}</p>
            </div>
            {analysisError && (
              <div style={{ fontSize: 10, color: "#F59E0B", marginTop: 8, textAlign: "center" }}>
                ⚠️ Analyse locale active
              </div>
            )}
          </div>
        )}

        <div className="wz-ai-footer">
          <IcoInfo />
          {hasContent ? "Priorité calculée par analyse IA locale" : "L'IA analysera votre demande en temps réel"}
        </div>
      </div>

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

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ navigate, ticketId }) {
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
            {ticketId && (
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
                Référence : #{ticketId}
              </p>
            )}
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

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState("next");
  const [form, setForm] = useState({
    titre: "",
    description: "",
    localisation: "",
    categorie: "",
    categorieAutre: "",
    urgence: "medium",
    telephone: "",
    photos: [],
  });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [createdId, setCreatedId] = useState(null);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setDir("next");
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setDir("back");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setApiError("");

    const cat =
      form.categorie === "Autre"
        ? `Autre — ${form.categorieAutre.trim()}`
        : form.categorie;

    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        categorie: cat,
        localisation: form.localisation.trim(),
        urgence: form.urgence,
        auteurTel: form.telephone.trim() || null,
      };
      const ticket = await ticketService.create(payload);
      setCreatedId(ticket._id);
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Erreur lors de la soumission. Réessayez.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const animCls = dir === "next" ? "wz-step-anim" : "wz-step-anim-back";
  const stepProps = { form, errors, set, animCls };

  if (loading) return <LoadingSpinner size={48} />;
  if (success) return <SuccessScreen navigate={navigate} ticketId={createdId} />;

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepProbleme {...stepProps} />;
      case 1:
        return (
          <StepLocalisation
            {...stepProps}
            showSugg={showSugg}
            setShowSugg={setShowSugg}
          />
        );
      case 2:
        return <StepUrgence {...stepProps} />;
      case 3:
        return (
          <StepContact
            {...stepProps}
            focused={focused}
            setFocused={setFocused}
            user={user}
          />
        );
      case 4:
        return (
          <StepRecap
            {...stepProps}
            user={user}
            setStep={setStep}
            setDir={setDir}
          />
        );
      default:
        return null;
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
            <div
              style={{
                padding: "10px 14px",
                marginBottom: 16,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                fontSize: 13,
                color: "#DC2626",
              }}
            >
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