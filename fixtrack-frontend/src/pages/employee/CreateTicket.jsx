// src/pages/employee/CreateTicket/CreateTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tickets } from "../../data/mockData";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { CSS }                                         from "./Wizardstyles";
import { STEPS, validateStep }                         from "./Wizardconstants";
import { Icon }                                        from "./Wizardconstants";
import {
  Sidebar, MobileProgress,
  StepProbleme, StepLocalisation, StepUrgence,
  StepContact,  StepRecap,
} from "./Wizardsteps";

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ navigate }) {
  return (
    <div className="wz">
      <style>{CSS}</style>
      <div className="wz-layout">
        <Sidebar current={5} />
        <div className="wz-main">
          <div className="wz-success">
            <div className="wz-success-ring">
              <Icon.CheckLg />
            </div>
            <h2 className="wz-success-title">Ticket soumis avec succès !</h2>
            <p className="wz-success-sub">
              Votre signalement a bien été enregistré.<br />
              Un technicien sera assigné dès que possible.
            </p>

            {/* Statut pill — clairement différencié d'un bouton */}
            <div className="wz-status-pill">
              <span className="wz-status-dot" />
              Statut : Ouvert
            </div>

            <div style={{ marginTop: 28 }}>
              <button
                className="wz-nav-btn-next"
                onClick={() => navigate("/employee/tickets")}
              >
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
  const navigate    = useNavigate();
  const { user }    = useAuth();

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

  // Generic field setter — clears error on change
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

  const goBack = () => {
    setDir("back");
    setStep(prev => prev - 1);
  };

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
      auteurId:      user?.id || user?.email || "u1",
      auteurTel:     form.telephone.trim() || null,
      technicienId:  null,
      dateCreation:  new Date().toISOString().split("T")[0],
      notes:         [],
    });
    setLoading(false);
    setSuccess(true);
  };

  // ── Shared props passed down to step components ───────────────────────────
  const animCls  = dir === "next" ? "wz-step-anim" : "wz-step-anim-back";
  const stepProps = { form, errors, set, animCls };

  if (loading)  return <LoadingSpinner size={48} />;
  if (success)  return <SuccessScreen navigate={navigate} />;

  // ── Step renderer ─────────────────────────────────────────────────────────
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
      <div className="wz-layout">

        <Sidebar current={step} />

        <div className="wz-main">
          <MobileProgress current={step} />

          {renderStep()}

          {/* Navigation buttons */}
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

      </div>
    </div>
  );
}