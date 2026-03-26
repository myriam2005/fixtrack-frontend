// src/pages/employee/CreateTicket/AIPanel.jsx
// ✅ Mirrors the backend calculatePriority algorithm in real-time
//    — 5 factors with visual chips, animated score, confidence indicator

// ── Constants mirroring utils/priorityAI.js ──────────────────────────────────
const HIGH_IMPACT_CATEGORIES = [
  "Électrique", "HVAC", "Informatique", "Sécurité",
  "Incendie", "Ascenseur", "Gaz", "Réseau",
];

const HIGH_TRAFFIC_KEYWORDS = [
  "amphi", "amphithéâtre", "salle", "classe", "cours",
  "labo", "laboratoire", "bibliothèque", "réfectoire", "cantine",
  "gymnase", "lobby", "réception", "hall", "restaurant", "piscine",
  "salle de sport", "salle de conférence", "salle de réunion",
  "open space", "plateau", "accueil", "bureau",
  "cage d'escalier", "ascenseur", "parking", "entrée",
  "couloir commun", "urgences", "bloc", "consultation", "salle d'attente",
  "caisse", "surface de vente",
];

const CRITICAL_ZONE_KEYWORDS = [
  "sortie de secours", "escalier de secours", "issue de secours",
  "tableau électrique", "compteur", "sprinkler", "extincteur",
  "chaufferie", "sous-station", "groupe électrogène",
  "salle serveur", "datacenter", "local it", "baie informatique",
  "cuisine", "office", "chambre froide", "stockage gaz",
];

const DANGER_KEYWORDS = [
  "feu", "fumée", "incendie", "inondation", "fuite gaz", "odeur gaz",
  "court-circuit", "électrocution", "blessé", "accident",
  "bloqué", "coincé", "inaccessible", "interdit", "dangereux",
  "risque chute", "sol glissant", "effondrement",
];

const URGENCE_PTS = { critical: 25, high: 15, medium: 8, low: 2 };

// ── Score computation ─────────────────────────────────────────────────────────
function computeScore(form) {
  const cat  = (form.categorie    || '').toLowerCase();
  const urg  = form.urgence       || 'medium';
  const loc  = (form.localisation || '').toLowerCase();
  const desc = (form.description  || '').toLowerCase();

  const factors = {
    categorie: HIGH_IMPACT_CATEGORIES.some(c => c.toLowerCase() === cat),
    urgence:   URGENCE_PTS[urg] || 0,
    location:  HIGH_TRAFFIC_KEYWORDS.some(kw => loc.includes(kw)),
    critical:  CRITICAL_ZONE_KEYWORDS.some(kw => loc.includes(kw)),
    danger:    DANGER_KEYWORDS.some(kw => desc.includes(kw) || loc.includes(kw)),
  };

  let score = 0;
  if (factors.categorie) score += 30;
  score += factors.urgence;
  if (factors.location)  score += 20;
  if (factors.critical)  score += 25;
  if (factors.danger)    score += 15;
  score = Math.min(100, Math.max(0, score));

  const priorite =
    score >= 80 ? 'critical' :
    score >= 60 ? 'high'     :
    score >= 35 ? 'medium'   : 'low';

  return { score, priorite, factors };
}

// ── Config maps ───────────────────────────────────────────────────────────────
const PRIO_CONFIG = {
  critical: {
    label: 'Critique',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    bar: '#EF4444',
    pill: { bg: '#FEE2E2', color: '#991B1B' },
  },
  high: {
    label: 'Haute',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    bar: '#F59E0B',
    pill: { bg: '#FEF3C7', color: '#92400E' },
  },
  medium: {
    label: 'Moyenne',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    bar: '#3B82F6',
    pill: { bg: '#DBEAFE', color: '#1E40AF' },
  },
  low: {
    label: 'Basse',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    bar: '#9CA3AF',
    pill: { bg: '#F3F4F6', color: '#4B5563' },
  },
};

const DELAI_MAP = {
  critical: '< 1 heure',
  high:     '2 – 4 heures',
  medium:   '1 – 2 jours',
  low:      'Cette semaine',
};

const SUGGESTIONS = {
  critical: "Signalez immédiatement à votre responsable. Une alerte urgente sera envoyée au technicien.",
  high:     "Vérifiez le disjoncteur ou les connexions locales avant l'arrivée du technicien.",
  medium:   "Notez l'heure d'apparition du problème pour faciliter le diagnostic.",
  low:      null,
};

const URGENCE_LABELS = {
  critical: 'Urgence critique',
  high:     'Urgence haute',
  medium:   'Urgence moyenne',
  low:      'Urgence basse',
};

const FACTOR_CONFIG = [
  { key: 'categorie',  label: 'Catégorie critique', pts: '+30', level: 'warn',   getValue: f => f.categorie },
  { key: 'urgence',    label: null,                 pts: null,  level: 'dynamic', getValue: f => f.urgence > 0 },
  { key: 'location',   label: 'Forte affluence',    pts: '+20', level: 'warn',   getValue: f => f.location },
  { key: 'critical',   label: 'Zone critique',      pts: '+25', level: 'danger', getValue: f => f.critical },
  { key: 'danger',     label: 'Mots danger',        pts: '+15', level: 'danger', getValue: f => f.danger },
];

// ── Subcomponents ─────────────────────────────────────────────────────────────
import { useState } from "react";

function ConfidenceDots({ form }) {
  const filled = [
    form.titre?.length > 4,
    form.description?.length > 10,
    form.localisation?.length > 3,
    form.categorie?.length > 0,
  ].filter(Boolean).length;

  const labels = ['Faible', 'Partielle', 'Bonne', 'Précise'];
  const colors = ['#D1D5DB', '#F59E0B', '#3B82F6', '#22C55E'];
  const idx = filled === 0 ? 0 : filled <= 1 ? 1 : filled <= 2 ? 1 : filled <= 3 ? 2 : 3;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
        Confiance : {labels[idx]}
      </span>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: i < filled ? colors[Math.min(idx, 3)] : '#E5E7EB',
            transition: 'background-color 0.4s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

function FactorPill({ active, icon, label, pts, level, urgenceLabel, urgencePts }) {
  const displayLabel = label || urgenceLabel;
  const displayPts   = pts   || (urgencePts ? `+${urgencePts}` : '+0');

  const colors = active
    ? level === 'danger'
      ? { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444' }
      : level === 'warn'
      ? { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' }
      : { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' }
    : { bg: '#F9FAFB', color: '#9CA3AF', border: '#E5E7EB', dot: '#D1D5DB' };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px',
      borderRadius: 20,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bg,
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: colors.dot,
        transition: 'background-color 0.3s ease',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, color: colors.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {displayLabel}
      </span>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: active ? colors.color : '#D1D5DB',
        opacity: active ? 1 : 0.6,
        letterSpacing: '0.02em',
      }}>
        {displayPts}
      </span>
    </div>
  );
}

function MetricItem({ label, value, accent }) {
  return (
    <div style={{
      flex: 1,
      padding: '10px 14px',
      backgroundColor: '#F9FAFB',
      borderRadius: 10,
      border: '1px solid #F3F4F6',
    }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent || '#111827' }}>
        {value}
      </div>
    </div>
  );
}

// ── Main AIPanel ──────────────────────────────────────────────────────────────
export function AIPanel({ form }) {
  const hasContent =
    form.titre?.length > 4        ||
    form.description?.length > 10 ||
    form.localisation?.length > 3 ||
    form.categorie?.length > 0;

  const { score, priorite, factors } = computeScore(form);
  const cfg = PRIO_CONFIG[priorite];

  const activeFactorCount = [
    factors.categorie,
    factors.urgence > 0,
    factors.location,
    factors.critical,
    factors.danger,
  ].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Main AI Card ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAFAFA',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Pulsing live dot */}
            <div style={{ position: 'relative', width: 8, height: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: hasContent ? '#22C55E' : '#D1D5DB',
                position: 'absolute',
                transition: 'background-color 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', letterSpacing: '0.02em' }}>
              Analyse IA en direct
            </span>
          </div>
          <ConfidenceDots form={form} />
        </div>

        {/* Body */}
        {!hasContent ? (
          <div style={{
            padding: '32px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            textAlign: 'center',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69H21l-4.94 3.58a1 1 0 0 0-.36 1.12L17.56 20 12 16.24 6.44 20l1.86-5.85a1 1 0 0 0-.36-1.12L3 9.45h6.17a1 1 0 0 0 .95-.69z"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, lineHeight: 1.5, maxWidth: 200 }}>
              Commencez à remplir le formulaire pour voir l'analyse en temps réel.
            </p>
          </div>
        ) : (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Priority + Score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>
                  Priorité estimée
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20,
                  backgroundColor: cfg.pill.bg,
                  border: `1px solid ${cfg.border}`,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    backgroundColor: cfg.bar, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: cfg.pill.color,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Score circle */}
              <div style={{
                width: 56, height: 56,
                borderRadius: '50%',
                border: `3px solid ${cfg.border}`,
                backgroundColor: cfg.bg,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.4s ease, background-color 0.4s ease',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500 }}>/ 100</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{
                height: 6, backgroundColor: '#F3F4F6',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${score}%`,
                  backgroundColor: cfg.bar,
                  borderRadius: 999,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease',
                }} />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 4,
              }}>
                {['Basse', 'Moyenne', 'Haute', 'Critique'].map((l, i) => (
                  <span key={i} style={{ fontSize: 9, color: '#D1D5DB' }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Factors */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#6B7280',
                marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Facteurs détectés
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <FactorPill
                  active={factors.categorie}
                  level="warn"
                  label="Catégorie critique"
                  pts="+30"
                />
                <FactorPill
                  active={factors.urgence > 0}
                  level={factors.urgence >= 25 ? 'danger' : 'warn'}
                  label={URGENCE_LABELS[form.urgence || 'medium']}
                  pts={`+${factors.urgence}`}
                />
                <FactorPill
                  active={factors.location}
                  level="warn"
                  label="Forte affluence"
                  pts="+20"
                />
                <FactorPill
                  active={factors.critical}
                  level="danger"
                  label="Zone critique"
                  pts="+25"
                />
                <FactorPill
                  active={factors.danger}
                  level="danger"
                  label="Mots danger"
                  pts="+15"
                />
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: 8 }}>
              <MetricItem
                label="Délai d'intervention"
                value={DELAI_MAP[priorite]}
                accent={cfg.color}
              />
              <MetricItem
                label="Catégorie"
                value={form.categorie || '—'}
              />
            </div>

            {/* Suggestion */}
            {SUGGESTIONS[priorite] && (
            <div style={{
              padding: '12px 14px',
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: 8,
                backgroundColor: cfg.pill.bg,
                border: `1px solid ${cfg.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {priorite === 'critical' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ) : priorite === 'high' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                )}
              </div>
              <p style={{
                fontSize: 12, color: cfg.pill.color,
                margin: 0, lineHeight: 1.6,
              }}>
                {SUGGESTIONS[priorite]}
              </p>
            </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid #F3F4F6',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
            {hasContent
              ? `Score calculé sur ${activeFactorCount} / 5 facteurs actifs`
              : "L'IA analysera votre demande en temps réel"}
          </span>
        </div>
      </div>

      {/* ── Help card ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            Besoin d'aide ?
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.6 }}>
          Consultez notre base de connaissances ou contactez le support technique interne.
        </p>
        <a href="#" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          color: '#2563EB',
          textDecoration: 'none',
          padding: '6px 12px',
          borderRadius: 8,
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          transition: 'background-color 0.2s ease',
        }}>
          Accéder au centre d'aide
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

    </div>
  );
}