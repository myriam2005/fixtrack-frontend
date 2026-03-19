// src/pages/employee/CreateTicket/WizardSteps.jsx
import Badge from "../../../components/common/badge/Badge";
import {
  Icon, LOC_SUGGESTIONS, URGENCES, STEPS, useDynamicCategories,
} from "./Wizardconstants";

// ── Shared primitives ─────────────────────────────────────────────────────────

export function FieldLabel({ htmlFor, label, req, note }) {
  return (
    <label htmlFor={htmlFor} className="wz-label">
      {label}
      {req  && <span className="wz-req"> *</span>}
      {note && <span className="wz-label-note">{note}</span>}
    </label>
  );
}

export function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="wz-err">
      <Icon.AlertCircle />
      {msg}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ current }) {
  return (
    <aside className="wz-sidebar">
      <div className="wz-sidebar-title">Étapes</div>
      {STEPS.map((s) => {
        const st = s.id < current ? "done" : s.id === current ? "active" : "idle";
        return (
          <div key={s.id} className="wz-step-item">
            <div className={`wz-step-bullet ${st}`}>
              {st === "done" ? <Icon.Check /> : s.id + 1}
            </div>
            <div>
              <div className={`wz-step-label ${st}`}>{s.label}</div>
              <div className={`wz-step-desc  ${st}`}>{s.short}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

// ── Mobile progress bar ───────────────────────────────────────────────────────

export function MobileProgress({ current }) {
  return (
    <div className="wz-mobile-progress">
      <div className="wz-mobile-steps">
        {STEPS.map((s) => {
          const st = s.id < current ? "done" : s.id === current ? "active" : "idle";
          return <div key={s.id} className={`wz-mobile-step-dot ${st}`} />;
        })}
      </div>
      <div className="wz-mobile-label">
        Étape <span>{current + 1}</span> sur {STEPS.length} — {STEPS[current].label}
      </div>
    </div>
  );
}

// ── Step 0 : Problème ─────────────────────────────────────────────────────────

export function StepProbleme({ form, errors, set, animCls }) {
  const dLen = form.description.trim().length;
  return (
    <div className={animCls}>
      <div className="wz-step-header">
        <div className="wz-step-eyebrow">Étape 1 sur 5</div>
        <h2 className="wz-step-title">Décrivez le problème</h2>
        <p className="wz-step-subtitle">
          Un titre clair et une description détaillée permettent au technicien d'intervenir rapidement.
        </p>
      </div>
      <div className="wz-fields">

        <div className="wz-field">
          <FieldLabel htmlFor="titre" label="Titre du problème" req />
          <input
            id="titre" type="text" autoFocus
            className={`wz-in${errors.titre ? " err" : ""}`}
            placeholder="Ex. : Fuite d'eau au plafond, Panne de chauffage…"
            value={form.titre} maxLength={100}
            onChange={e => set("titre", e.target.value)}
          />
          <div className="wz-ff">
            <FieldError msg={errors.titre} />
            <span className="wz-cnt">{form.titre.length}/100</span>
          </div>
        </div>

        <div className="wz-field">
          <FieldLabel htmlFor="desc" label="Description" req note="— minimum 20 caractères" />
          <textarea
            id="desc"
            className={`wz-ta${errors.description ? " err" : ""}`}
            placeholder="Décrivez le problème : depuis quand, symptômes observés, tentatives effectuées…"
            value={form.description} rows={5} maxLength={500}
            onChange={e => set("description", e.target.value)}
          />
          <div className="wz-ff">
            <FieldError msg={errors.description} />
            <div className="wz-pw">
              <div className="wz-pb">
                <div className="wz-pf" style={{
                  width: `${Math.min((dLen / 20) * 100, 100)}%`,
                  background: dLen >= 20 ? "#059669" : "#2563EB",
                }} />
              </div>
              <span className="wz-cnt" style={{ color: dLen >= 20 ? "#059669" : "#94A3B8" }}>
                {dLen}/500
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Step 1 : Localisation & Catégorie ────────────────────────────────────────
// ✅ Charge les catégories depuis l'API via useDynamicCategories

export function StepLocalisation({ form, errors, set, showSugg, setShowSugg, animCls }) {
  // ✅ Catégories dynamiques depuis l'API (fallback sur les défauts)
  const categories = useDynamicCategories();

  const filtered = form.localisation.length > 0
    ? LOC_SUGGESTIONS.filter(s =>
        s.toLowerCase().startsWith(form.localisation[0].toLowerCase())
      )
    : [];

  return (
    <div className={animCls}>
      <div className="wz-step-header">
        <div className="wz-step-eyebrow">Étape 2 sur 5</div>
        <h2 className="wz-step-title">Où et quelle catégorie ?</h2>
        <p className="wz-step-subtitle">
          Indiquez l'emplacement exact et le type de problème pour orienter l'intervention.
        </p>
      </div>
      <div className="wz-fields">

        {/* Localisation */}
        <div className="wz-field">
          <FieldLabel htmlFor="loc" label="Localisation" req note="— où se trouve le problème ?" />
          <div className="wz-iw">
            <span className="wz-ico"><Icon.Pin /></span>
            <input
              id="loc" type="text" autoFocus
              className={`wz-in ico${errors.localisation ? " err" : ""}`}
              placeholder="Ex. : Bâtiment B — Salle 12, Chambre 204…"
              value={form.localisation} maxLength={100}
              onChange={e => { set("localisation", e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            />
            {showSugg && filtered.length > 0 && (
              <div className="wz-sugg">
                {filtered.map((s, i) => (
                  <button key={i} type="button" className="wz-si"
                    onMouseDown={() => { set("localisation", s); setShowSugg(false); }}>
                    <span style={{ color: "#2563EB", display: "flex", flexShrink: 0 }}>
                      <Icon.Pin />
                    </span>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <FieldError msg={errors.localisation} />
        </div>

        {/* Catégories — chargées depuis l'API */}
        <div className="wz-field">
          <FieldLabel label="Catégorie du problème" req />
          <div className="wz-cg">
            {categories.map((cat) => {
              const CatIcon = cat.IcoComp;
              return (
                <button key={cat.value} type="button"
                  className={`wz-cb${form.categorie === cat.value ? " on" : ""}`}
                  onClick={() => {
                    set("categorie", cat.value);
                    if (cat.value !== "Autre") set("categorieAutre", "");
                  }}>
                  <span className="wz-cb-ico"><CatIcon /></span>
                  <span>{cat.value}</span>
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.categorie} />

          {form.categorie === "Autre" && (
            <div style={{ marginTop: 14 }} className="wz-field">
              <FieldLabel htmlFor="cat-a" label="Précisez la catégorie" req />
              <input id="cat-a" type="text" autoFocus
                className={`wz-in${errors.categorieAutre ? " err" : ""}`}
                placeholder="Ex. : Ascenseur, Signalétique, Jardinage…"
                value={form.categorieAutre} maxLength={60}
                onChange={e => set("categorieAutre", e.target.value)}
              />
              <FieldError msg={errors.categorieAutre} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Step 2 : Urgence ──────────────────────────────────────────────────────────

export function StepUrgence({ form, set, animCls }) {
  return (
    <div className={animCls}>
      <div className="wz-step-header">
        <div className="wz-step-eyebrow">Étape 3 sur 5</div>
        <h2 className="wz-step-title">Quel est le niveau d'urgence ?</h2>
        <p className="wz-step-subtitle">
          Évaluez honnêtement l'impact sur votre activité pour que les urgences réelles soient traitées en priorité.
        </p>
      </div>
      <div className="wz-ul">
        {URGENCES.map(u => (
          <label key={u.value} htmlFor={`urg-${u.value}`}
            className="wz-uc"
            style={form.urgence === u.value ? { borderColor: u.border, background: u.bg } : {}}>
            <input
              type="radio" id={`urg-${u.value}`} name="urgence"
              value={u.value} className="wz-ur"
              checked={form.urgence === u.value}
              onChange={() => set("urgence", u.value)}
            />
            <span
              className={`wz-udot${form.urgence === u.value ? " on" : ""}`}
              style={{ color: u.dot }}
            />
            <div className="wz-ui">
              <div className="wz-un" style={{ color: form.urgence === u.value ? u.color : "#0F172A" }}>
                {u.label}
              </div>
              <div className="wz-ud">{u.desc}</div>
            </div>
            <Badge status={u.value} />
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Step 3 : Contact & Photos ─────────────────────────────────────────────────

export function StepContact({ form, errors, set, focused, setFocused, user, animCls }) {
  return (
    <div className={animCls}>
      <div className="wz-step-header">
        <div className="wz-step-eyebrow">Étape 4 sur 5</div>
        <h2 className="wz-step-title">Vos coordonnées</h2>
        <p className="wz-step-subtitle">
          Vos informations sont automatiquement associées au ticket. Ajoutez un numéro si vous souhaitez être joint rapidement.
        </p>
      </div>
      <div className="wz-fields">

        {user && (
          <div className="wz-cc">
            <div className="wz-av">
              {user.avatar || (user.nom
                ? user.nom.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                : "?")}
            </div>
            <div>
              <div className="wz-av-n">{user.nom || user.email}</div>
              <div className="wz-av-e">{user.email}</div>
            </div>
            <span className="wz-role">{user.role || "employé"}</span>
          </div>
        )}

        <div className="wz-field">
          <FieldLabel htmlFor="tel" label="Téléphone" note="— optionnel" />
          <div className="wz-iw">
            <span className="wz-ico"><Icon.Phone /></span>
            <input id="tel" type="tel"
              className={`wz-in ico${errors.telephone ? " err" : ""}`}
              placeholder="Ex. : +216 XX XXX XXX"
              value={form.telephone} maxLength={20}
              onChange={e => set("telephone", e.target.value)}
              onFocus={() => setFocused("tel")} onBlur={() => setFocused("")}
            />
          </div>
          <FieldError msg={errors.telephone} />
        </div>

        <div className="wz-field">
          <FieldLabel label="Photos" note="— optionnel" />
          <label style={{ display: "block", cursor: "pointer" }}>
            <div className={`wz-pz${focused === "photos" ? " on" : ""}`}>
              <div className="wz-pico"><Icon.Image /></div>
              <div className="wz-pt">
                {form.photos.length > 0
                  ? `${form.photos.length} fichier${form.photos.length > 1 ? "s" : ""} sélectionné${form.photos.length > 1 ? "s" : ""}`
                  : "Glissez vos photos ou cliquez pour parcourir"}
              </div>
              <div className="wz-ps">PNG, JPG, WEBP — max 5 Mo</div>
            </div>
            <input type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={e => set("photos", Array.from(e.target.files || []))}
              onFocus={() => setFocused("photos")} onBlur={() => setFocused("")}
            />
          </label>
          {form.photos.length > 0 && (
            <div className="wz-pl">
              {form.photos.map((f, i) => (
                <div key={i} className="wz-pi">
                  <Icon.File />
                  <span className="wz-pn">{f.name}</span>
                  <span className="wz-psz">{(f.size / 1024).toFixed(0)} Ko</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Step 4 : Récapitulatif ────────────────────────────────────────────────────

export function StepRecap({ form, user, setStep, setDir, animCls }) {
  const goTo = (n) => { setDir("back"); setStep(n); };

  const catLabel = form.categorie === "Autre"
    ? `Autre — ${form.categorieAutre}`
    : form.categorie;

  const urgenceLabel = URGENCES.find(u => u.value === form.urgence)?.label;

  return (
    <div className={animCls}>
      <div className="wz-step-header">
        <div className="wz-step-eyebrow">Étape 5 sur 5</div>
        <h2 className="wz-step-title">Vérifiez avant d'envoyer</h2>
        <p className="wz-step-subtitle">
          Relisez les informations. Vous pouvez revenir modifier une section si besoin.
        </p>
      </div>

      <div className="wz-recap">

        <div className="wz-recap-block">
          <div className="wz-recap-head">
            Problème
            <button className="wz-recap-edit" onClick={() => goTo(0)}>Modifier</button>
          </div>
          <div className="wz-recap-body">
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Titre</span>
              <span className="wz-recap-val">{form.titre}</span>
            </div>
            <div className="wz-recap-div" />
            <div>
              <span className="wz-recap-lbl" style={{ display: "block", marginBottom: 6 }}>Description</span>
              <p style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.6, margin: 0 }}>{form.description}</p>
            </div>
          </div>
        </div>

        <div className="wz-recap-block">
          <div className="wz-recap-head">
            Localisation & Catégorie
            <button className="wz-recap-edit" onClick={() => goTo(1)}>Modifier</button>
          </div>
          <div className="wz-recap-body">
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Localisation</span>
              <span className="wz-recap-val">{form.localisation}</span>
            </div>
            <div className="wz-recap-div" />
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Catégorie</span>
              <span className="wz-recap-val">{catLabel}</span>
            </div>
          </div>
        </div>

        <div className="wz-recap-block">
          <div className="wz-recap-head">
            Urgence
            <button className="wz-recap-edit" onClick={() => goTo(2)}>Modifier</button>
          </div>
          <div className="wz-recap-body">
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Priorité</span>
              <Badge status={form.urgence} />
            </div>
            <div className="wz-recap-div" />
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Niveau</span>
              <span className="wz-recap-val">{urgenceLabel}</span>
            </div>
          </div>
        </div>

        <div className="wz-recap-block">
          <div className="wz-recap-head">
            Contact
            <button className="wz-recap-edit" onClick={() => goTo(3)}>Modifier</button>
          </div>
          <div className="wz-recap-body">
            <div className="wz-recap-row">
              <span className="wz-recap-lbl">Déclarant</span>
              <span className="wz-recap-val">{user?.nom || user?.email || "—"}</span>
            </div>
            {form.telephone && (
              <>
                <div className="wz-recap-div" />
                <div className="wz-recap-row">
                  <span className="wz-recap-lbl">Téléphone</span>
                  <span className="wz-recap-val">{form.telephone}</span>
                </div>
              </>
            )}
            {form.photos.length > 0 && (
              <>
                <div className="wz-recap-div" />
                <div className="wz-recap-row">
                  <span className="wz-recap-lbl">Photos</span>
                  <span className="wz-recap-val">
                    {form.photos.length} fichier{form.photos.length > 1 ? "s" : ""}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}