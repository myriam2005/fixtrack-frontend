// src/pages/employee/CreerTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tickets } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

import Badge          from "../../components/common/Badge";
import Button         from "../../components/common/Button";
import Modal          from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ── Tokens visuels ────────────────────────────────────────────────────────────
const T = {
  accent:        "#2563EB",
  accentHover:   "#1d4ed8",
  accentLight:   "#EFF6FF",
  border:        "#E2E8F0",
  borderFocus:   "#2563EB",
  bg:            "#F8FAFC",
  surface:       "#FFFFFF",
  text:          "#0F172A",
  textSub:       "#475569",
  textMuted:     "#94A3B8",
  error:         "#DC2626",
  errorBorder:   "#FCA5A5",
  success:       "#059669",
  successBg:     "#ECFDF5",
  successBorder: "#6EE7B7",
  radius:        "12px",
};

// ── Catégories universelles ───────────────────────────────────────────────────
const CATEGORIES = [
  { value: "Électrique",        icon: "⚡" },
  { value: "Plomberie",         icon: "🚿" },
  { value: "HVAC",              icon: "❄️" },
  { value: "Informatique",      icon: "💻" },
  { value: "Menuiserie/Mobilier", icon: "🪑" },
  { value: "Hygiène/Nettoyage", icon: "🧹" },
  { value: "Sécurité",          icon: "🔒" },
  { value: "Mécanique",         icon: "⚙️" },
  { value: "Autre",             icon: "📋" },
];

// ── Suggestions de localisation ───────────────────────────────────────────────
const LOC_SUGGESTIONS = [
  "Bâtiment A", "Bâtiment B", "Bâtiment C",
  "Étage 1", "Étage 2", "RDC",
  "Salle de réunion", "Couloir", "Parking",
  "Sous-sol", "Cafétéria", "Accueil",
];

// ── Niveaux d'urgence ─────────────────────────────────────────────────────────
const URGENCES = [
  { value: "critical", label: "Activité arrêtée",   desc: "Travail complètement bloqué",     color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
  { value: "high",     label: "Activité ralentie",  desc: "Travail difficile mais possible",  color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  { value: "medium",   label: "Activité normale",   desc: "Problème gênant non bloquant",     color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  { value: "low",      label: "Peu urgent",          desc: "À traiter quand possible",         color: "#6B7280", bg: "#F9FAFB", border: "#D1D5DB" },
];

// ── Styles réutilisables ──────────────────────────────────────────────────────
const inputStyle = (hasError, isFocused) => ({
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", fontSize: 14, color: T.text,
  backgroundColor: T.surface, fontFamily: "inherit",
  border: `1.5px solid ${hasError ? T.errorBorder : isFocused ? T.borderFocus : T.border}`,
  borderRadius: "9px", outline: "none",
  boxShadow: isFocused ? `0 0 0 3px ${T.accentLight}` : "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

// ── Sous-composants ───────────────────────────────────────────────────────────
function SectionHeader({ num, label }) {
  return (
    <div style={{
      padding: "11px 24px", backgroundColor: T.bg,
      borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        backgroundColor: T.accent, color: "#fff",
        fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{num}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {label}
      </span>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: T.error }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.error} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </span>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>
      {children}
    </label>
  );
}

function Req() { return <span style={{ color: T.error, marginLeft: 2 }}>*</span>; }
function Divider() { return <div style={{ height: 1, backgroundColor: T.border }} />; }

// ── Page principale ───────────────────────────────────────────────────────────
export default function CreateTicket() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [form, setForm] = useState({
    titre:         "",
    description:   "",
    localisation:  "",
    categorie:     "",
    categorieAutre:"",
    urgence:       "medium",
    telephone:     "",
    photos:        [],
  });
  const [errors,      setErrors]      = useState({});
  const [focused,     setFocused]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Suggestions filtrées selon la saisie
  const filteredSuggestions = LOC_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(form.localisation.toLowerCase()) && form.localisation.length > 0
  );

  const validate = () => {
    const e = {};
    if (!form.titre.trim())               e.titre        = "Le titre est obligatoire.";
    else if (form.titre.trim().length < 5) e.titre        = "Minimum 5 caractères.";
    if (!form.description.trim())         e.description  = "La description est obligatoire.";
    else if (form.description.trim().length < 20)
      e.description = `${form.description.trim().length}/20 caractères minimum.`;
    if (!form.localisation.trim())        e.localisation = "La localisation est obligatoire.";
    if (!form.categorie)                  e.categorie    = "Veuillez choisir une catégorie.";
    if (form.categorie === "Autre" && !form.categorieAutre.trim())
      e.categorieAutre = "Précisez la catégorie.";
    if (form.telephone && !/^[+\d\s\-()]{6,20}$/.test(form.telephone))
      e.telephone = "Numéro invalide.";
    return e;
  };

  const handleSubmitClick = () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const categorieFinale = form.categorie === "Autre"
      ? `Autre — ${form.categorieAutre.trim()}`
      : form.categorie;

    const newTicket = {
      id:            `t${Date.now()}`,
      titre:         form.titre.trim(),
      description:   form.description.trim(),
      statut:        "open",
      priorite:      form.urgence,
      categorie:     categorieFinale,
      localisation:  form.localisation.trim(),
      auteurId:      user?.id || user?.email || "u1",
      auteurTel:     form.telephone.trim() || null,
      technicienId:  null,
      dateCreation:  new Date().toISOString().split("T")[0],
      notes:         [],
    };
    tickets.push(newTicket);

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/employee/tickets"), 2000);
  };

  const descLen = form.description.trim().length;

  if (loading) return <LoadingSpinner size={48} />;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* ── En-tête ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: "8px", fontFamily: "inherit",
              border: `1px solid ${T.border}`, backgroundColor: T.surface,
              color: T.textSub, fontSize: 13, cursor: "pointer", transition: "all 0.14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </button>
          <span style={{ fontSize: 12, color: T.textMuted }}>Mes tickets</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Nouveau ticket</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.4px" }}>
          Signaler un problème
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMuted }}>
          Les champs marqués <span style={{ color: T.error }}>*</span> sont obligatoires.
        </p>
      </div>

      {/* ── Bannière succès ── */}
      {success && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px", borderRadius: T.radius, marginBottom: 20,
          backgroundColor: T.successBg, border: `1.5px solid ${T.successBorder}`,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#065F46" }}>Ticket créé avec succès !</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#047857" }}>Redirection vers vos tickets dans 2 secondes…</p>
          </div>
          <div style={{ marginLeft: "auto" }}><Badge status="open" /></div>
        </div>
      )}

      {/* ── Formulaire ── */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
      }}>

        {/* ══ Section 1 : Identification ══ */}
        <SectionHeader num="1" label="Identification du problème" />
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Titre */}
          <div>
            <FieldLabel htmlFor="titre">Titre du problème <Req /></FieldLabel>
            <input
              id="titre" type="text"
              placeholder="Ex. : Fuite d'eau au plafond, Panne de chauffage, Écran cassé…"
              value={form.titre} maxLength={100}
              onChange={e => set("titre", e.target.value)}
              onFocus={() => setFocused("titre")} onBlur={() => setFocused("")}
              style={inputStyle(!!errors.titre, focused === "titre")}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <FieldError msg={errors.titre} />
              <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{form.titre.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <FieldLabel htmlFor="description">
              Description <Req />
              <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 4 }}>— minimum 20 caractères</span>
            </FieldLabel>
            <textarea
              id="description"
              placeholder="Décrivez le problème : depuis quand, symptômes observés, tentatives déjà effectuées…"
              value={form.description} rows={4} maxLength={500}
              onChange={e => set("description", e.target.value)}
              onFocus={() => setFocused("description")} onBlur={() => setFocused("")}
              style={{ ...inputStyle(!!errors.description, focused === "description"), resize: "vertical", minHeight: 100 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <FieldError msg={errors.description} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <div style={{ width: 56, height: 4, borderRadius: 2, backgroundColor: T.border, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2, transition: "width 0.2s, background-color 0.2s",
                    width: `${Math.min((descLen / 20) * 100, 100)}%`,
                    backgroundColor: descLen >= 20 ? T.success : T.accent,
                  }} />
                </div>
                <span style={{ fontSize: 11, color: descLen >= 20 ? T.success : T.textMuted }}>{descLen}/500</span>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ══ Section 2 : Localisation & Catégorie ══ */}
        <SectionHeader num="2" label="Localisation et catégorie" />
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Localisation avec suggestions */}
          <div>
            <FieldLabel htmlFor="localisation">
              Localisation <Req />
              <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 4 }}>— où se trouve le problème ?</span>
            </FieldLabel>
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                {/* Icône pin */}
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: T.textMuted }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <input
                  id="localisation" type="text"
                  placeholder="Ex. : Bâtiment B — Salle 12, Couloir RDC, Chambre 204…"
                  value={form.localisation} maxLength={100}
                  onChange={e => { set("localisation", e.target.value); setShowSuggestions(true); }}
                  onFocus={() => { setFocused("localisation"); setShowSuggestions(true); }}
                  onBlur={() => { setFocused(""); setTimeout(() => setShowSuggestions(false), 150); }}
                  style={{ ...inputStyle(!!errors.localisation, focused === "localisation"), paddingLeft: 36 }}
                />
              </div>

              {/* Dropdown suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                  backgroundColor: T.surface, border: `1.5px solid ${T.borderFocus}`,
                  borderRadius: "9px", overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
                }}>
                  {filteredSuggestions.map((s, i) => (
                    <button
                      key={i} type="button"
                      onMouseDown={() => { set("localisation", s); setShowSuggestions(false); }}
                      style={{
                        width: "100%", padding: "9px 14px", textAlign: "left",
                        border: "none", backgroundColor: "transparent", cursor: "pointer",
                        fontSize: 13, color: T.text, fontFamily: "inherit",
                        borderBottom: i < filteredSuggestions.length - 1 ? `1px solid ${T.border}` : "none",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = T.accentLight}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <FieldError msg={errors.localisation} />
          </div>

          {/* Catégorie — boutons toggle avec icônes */}
          <div>
            <FieldLabel>Catégorie du problème <Req /></FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value} type="button"
                  onClick={() => { set("categorie", cat.value); if (cat.value !== "Autre") set("categorieAutre", ""); }}
                  style={{
                    padding: "7px 14px", borderRadius: "8px", fontSize: 13,
                    fontWeight: form.categorie === cat.value ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.14s",
                    border: `1.5px solid ${form.categorie === cat.value ? T.accent : T.border}`,
                    backgroundColor: form.categorie === cat.value ? T.accentLight : T.surface,
                    color: form.categorie === cat.value ? T.accent : T.textSub,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{cat.icon}</span>
                  {cat.value}
                </button>
              ))}
            </div>
            <FieldError msg={errors.categorie} />

            {/* Champ "Autre" conditionnel */}
            {form.categorie === "Autre" && (
              <div style={{ marginTop: 12 }}>
                <input
                  type="text"
                  placeholder="Précisez la catégorie…"
                  value={form.categorieAutre} maxLength={60}
                  onChange={e => set("categorieAutre", e.target.value)}
                  onFocus={() => setFocused("categorieAutre")} onBlur={() => setFocused("")}
                  style={inputStyle(!!errors.categorieAutre, focused === "categorieAutre")}
                  autoFocus
                />
                <FieldError msg={errors.categorieAutre} />
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* ══ Section 3 : Urgence ══ */}
        <SectionHeader num="3" label="Niveau d'urgence" />
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: T.textMuted }}>
            Évaluez l'impact sur votre activité pour aider à prioriser l'intervention.
          </p>
          {URGENCES.map(u => (
            <label
              key={u.value} htmlFor={`urgence-${u.value}`}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 16px", borderRadius: "10px", cursor: "pointer",
                border: `1.5px solid ${form.urgence === u.value ? u.border : T.border}`,
                backgroundColor: form.urgence === u.value ? u.bg : T.surface,
                transition: "all 0.14s",
              }}
            >
              <input
                type="radio" id={`urgence-${u.value}`} name="urgence" value={u.value}
                checked={form.urgence === u.value} onChange={() => set("urgence", u.value)}
                style={{ accentColor: u.color, width: 16, height: 16, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: form.urgence === u.value ? u.color : T.text }}>
                  {u.label}
                </span>
                <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8 }}>— {u.desc}</span>
              </div>
              <Badge status={u.value} />
            </label>
          ))}
        </div>

        <Divider />

        {/* ══ Section 4 : Contact ══ */}
        <SectionHeader num="4" label="Contact" />
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Info déclarant (auto depuis auth) */}
          {user && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px",
              backgroundColor: T.bg, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                backgroundColor: T.accent, color: "#fff",
                fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {user.avatar || (user.nom ? user.nom.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?")}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>{user.nom || user.email}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>{user.email}</p>
              </div>
              {/* Badge rôle */}
              <span style={{
                padding: "3px 10px", borderRadius: "6px", fontSize: 11, fontWeight: 600,
                backgroundColor: T.accentLight, color: T.accent, textTransform: "capitalize",
              }}>
                {user.role || "employé"}
              </span>
            </div>
          )}

          {/* Téléphone optionnel */}
          <div>
            <FieldLabel htmlFor="telephone">
              Téléphone
              <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 4 }}>— optionnel, pour vous joindre rapidement</span>
            </FieldLabel>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: T.textMuted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
                </svg>
              </div>
              <input
                id="telephone" type="tel"
                placeholder="Ex. : +216 XX XXX XXX"
                value={form.telephone} maxLength={20}
                onChange={e => set("telephone", e.target.value)}
                onFocus={() => setFocused("telephone")} onBlur={() => setFocused("")}
                style={{ ...inputStyle(!!errors.telephone, focused === "telephone"), paddingLeft: 36 }}
              />
            </div>
            <FieldError msg={errors.telephone} />
          </div>
        </div>

        <Divider />

        {/* ══ Section 5 : Photos ══ */}
        <SectionHeader num="5" label="Photos (optionnel)" />
        <div style={{ padding: "20px 24px 24px" }}>
          <label style={{ display: "block", cursor: "pointer" }}>
            <div style={{
              border: `2px dashed ${focused === "photos" ? T.accent : T.border}`,
              borderRadius: "10px", padding: "24px 20px", textAlign: "center",
              backgroundColor: focused === "photos" ? T.accentLight : T.bg,
              transition: "all 0.15s",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: T.textSub }}>
                {form.photos.length > 0
                  ? `${form.photos.length} fichier${form.photos.length > 1 ? "s" : ""} sélectionné${form.photos.length > 1 ? "s" : ""}`
                  : "Cliquez pour ajouter des photos"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>PNG, JPG, WEBP — max 5 Mo par fichier</p>
            </div>
            <input
              type="file" accept="image/*" multiple
              onChange={e => set("photos", Array.from(e.target.files || []))}
              onFocus={() => setFocused("photos")} onBlur={() => setFocused("")}
              style={{ display: "none" }}
            />
          </label>

          {form.photos.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {form.photos.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: "8px",
                  backgroundColor: T.bg, border: `1px solid ${T.border}`,
                  fontSize: 13, color: T.textSub,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} Ko</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingBottom: 8 }}>
        <Button label="Annuler" variant="secondary" onClick={() => navigate(-1)} disabled={success} />
        <Button
          label={success ? "✓ Ticket créé !" : "Soumettre le ticket"}
          variant="primary" onClick={handleSubmitClick} disabled={success}
        />
      </div>

      {/* ── Modal de confirmation ── */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmer la soumission">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: T.textSub }}>
            Vous êtes sur le point de soumettre le ticket suivant :
          </p>

          <div style={{
            padding: "14px 16px", borderRadius: "10px",
            backgroundColor: T.bg, border: `1px solid ${T.border}`,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <Row label="Titre"        value={form.titre} />
            <Row label="Localisation" value={form.localisation} />
            <Row label="Catégorie"    value={form.categorie === "Autre"
              ? `Autre — ${form.categorieAutre}` : form.categorie} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Urgence</span>
              <Badge status={form.urgence} />
            </div>
            {user && <Row label="Déclarant" value={user.nom || user.email} />}
            {form.telephone && <Row label="Téléphone" value={form.telephone} />}
          </div>

          <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>
            Un technicien sera assigné dès que possible. Voulez-vous confirmer ?
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Button label="Annuler"   variant="secondary" onClick={() => setConfirmOpen(false)} />
            <Button label="Confirmer" variant="primary"   onClick={handleConfirm} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600, maxWidth: 300, textAlign: "right" }}>{value}</span>
    </div>
  );
}