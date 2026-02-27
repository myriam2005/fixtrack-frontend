// src/pages/tech/ticketsUtils.jsx

export const FILTERS = [
  { key: "all",         label: "Tous"       },
  { key: "assigned",    label: "Assigné"    },
  { key: "in_progress", label: "En cours"   },
  { key: "pending",     label: "En attente" },
  { key: "resolved",    label: "Résolu"     },
];

export const PRIORITY_FILTERS = [
  { key: "all",      label: "Toutes priorités" },
  { key: "critical", label: "Critique"          },
  { key: "high",     label: "Haute"             },
  { key: "medium",   label: "Moyenne"           },
  { key: "low",      label: "Basse"             },
];

export const STRIPE_CLASS = {
  critical: "stripe-critical",
  high:     "stripe-high",
  medium:   "stripe-medium",
  low:      "stripe-low",
};

export const STRIPE_COLOR = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#3B82F6",
  low:      "#94A3B8",
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');

.ta *, .ta *::before, .ta *::after { box-sizing: border-box; }
.ta { font-family: 'DM Sans', sans-serif; color: #0F172A; padding: 32px 40px 64px; background: #F8FAFC; min-height: 100vh; }
@media(max-width:640px) { .ta { padding: 20px 16px 48px; } }

.ta-header { margin-bottom: 28px; }
.ta-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #2563EB;
  margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
}
.ta-eyebrow::before { content: ''; display: block; width: 16px; height: 2px; background: #2563EB; border-radius: 2px; }
.ta-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px, 4vw, 30px); font-weight: 400;
  color: #0F172A; letter-spacing: -0.02em; line-height: 1.2; margin: 0 0 6px;
}
.ta-subtitle { font-size: 14px; color: #64748B; margin: 0; }

/* ── Barre de recherche + filtres ── */
.ta-toolbar {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap; margin-bottom: 24px;
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 14px; padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}
.ta-search-wrap {
  flex: 1; min-width: 200px; position: relative; display: flex; align-items: center;
}
.ta-search-ico {
  position: absolute; left: 12px; color: #94A3B8; pointer-events: none;
  display: flex; align-items: center;
}
.ta-search {
  width: 100%; padding: 9px 12px 9px 36px;
  border: 1.5px solid #E2E8F0; border-radius: 10px;
  font-size: 13px; font-family: inherit; color: #0F172A;
  background: #F8FAFC; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.ta-search:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); background: #fff; }
.ta-search::placeholder { color: #CBD5E1; }

.ta-select-wrap { display: flex; align-items: center; gap: 6px; }
.ta-select-label { font-size: 12px; font-weight: 600; color: #64748B; white-space: nowrap; }
.ta-select {
  padding: 8px 28px 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 10px;
  font-size: 13px; font-family: inherit; color: #0F172A; background: #F8FAFC;
  outline: none; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  transition: border-color 0.18s;
}
.ta-select:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }

.ta-filter-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 10px;
  border: 1.5px solid #E2E8F0; background: #F8FAFC;
  color: #64748B; cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.ta-filter-icon-btn:hover { border-color: #BFDBFE; color: #2563EB; background: #EFF6FF; }
.ta-filter-btn:hover { border-color: #BFDBFE; color: #1D4ED8; background: #F0F7FF; }
.ta-filter-btn.on    { border-color: #2563EB; background: #EFF6FF; color: #2563EB; font-weight: 600; }
.ta-filter-count {
  font-size: 11px; font-weight: 700; background: #E2E8F0; color: #64748B;
  padding: 1px 7px; border-radius: 10px; min-width: 20px; text-align: center;
}
.ta-filter-btn.on .ta-filter-count { background: #DBEAFE; color: #2563EB; }

/* ── Empty state ── */
.ta-empty { text-align: center; padding: 64px 24px; }
.ta-empty-icon {
  width: 56px; height: 56px; border-radius: 16px; background: #F1F5F9;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: #CBD5E1;
}

/* ── Grid ── */
.ta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
@media(max-width:700px) { .ta-grid { grid-template-columns: 1fr; } }

/* ── Card ── */
.ta-card {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  transition: box-shadow 0.2s, transform 0.2s; display: flex; flex-direction: column;
  position: relative;
}
.ta-card:hover { box-shadow: 0 8px 32px rgba(15,23,42,0.10); transform: translateY(-2px); }

/* Bandeau image de fond en haut */
.ta-card-banner {
  height: 72px; position: relative; overflow: hidden; flex-shrink: 0;
  display: flex; align-items: flex-end; padding: 10px 14px;
}
.ta-card-banner-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  filter: brightness(0.55);
}
.ta-card-banner-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.55) 100%);
}
.ta-card-banner-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between; width: 100%;
}
.ta-card-ticket-id {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.85);
  letter-spacing: 0.05em; text-transform: uppercase;
}

/* Badge ACTIVE TASK */
.ta-active-badge {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  background: #2563EB; color: #fff; padding: 3px 8px; border-radius: 6px;
}
.ta-active-badge.pending { background: #D97706; }
.ta-active-badge.resolved { background: #059669; }
.ta-active-badge.assigned { background: #6366F1; }

.ta-card-stripe  { height: 3px; flex-shrink: 0; }
.stripe-critical { background: linear-gradient(90deg, #EF4444, #DC2626); }
.stripe-high     { background: linear-gradient(90deg, #F97316, #EA580C); }
.stripe-medium   { background: linear-gradient(90deg, #3B82F6, #2563EB); }
.stripe-low      { background: linear-gradient(90deg, #94A3B8, #6B7280); }

.ta-card-body  { padding: 16px 18px 12px; flex: 1; }
.ta-card-top   { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.ta-card-title { font-size: 15px; font-weight: 700; color: #0F172A; line-height: 1.35; flex: 1; }
.ta-card-meta  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.ta-card-cat   { font-size: 11px; font-weight: 600; color: #64748B; background: #F1F5F9; padding: 3px 10px; border-radius: 8px; text-transform: uppercase; }
.ta-card-loc   { font-size: 12px; color: #94A3B8; display: flex; align-items: center; gap: 4px; }
.ta-card-desc  { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 12px; }
.ta-card-date  { font-size: 11px; color: #CBD5E1; font-weight: 500; }
.ta-card-footer {
  padding: 12px 18px; background: #F8FAFC; border-top: 1px solid #F1F5F9;
  display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
}

/* Statut inline dans footer */
.ta-card-status-row {
  display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; font-weight: 500;
}
.ta-card-status-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}

.ta-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.18s; white-space: nowrap;
}
.ta-btn-accept        { background: #2563EB; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
.ta-btn-accept:hover  { background: #1D4ED8; box-shadow: 0 4px 16px rgba(37,99,235,0.35); transform: translateY(-1px); }
.ta-btn-hold          { background: #fff; color: #D97706; border: 1.5px solid #FCD34D; }
.ta-btn-hold:hover    { background: #FFFBEB; border-color: #F59E0B; }
.ta-btn-resolve       { background: #059669; color: #fff; box-shadow: 0 2px 8px rgba(5,150,105,0.25); }
.ta-btn-resolve:hover { background: #047857; box-shadow: 0 4px 16px rgba(5,150,105,0.35); transform: translateY(-1px); }
.ta-btn-disabled      { background: #F1F5F9; color: #94A3B8; cursor: default; font-size: 12px; padding: 8px 14px; }

.ta-modal-body   { display: flex; flex-direction: column; gap: 18px; }
.ta-modal-label  { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 8px; }
.ta-modal-ta {
  width: 100%; padding: 13px 16px; resize: vertical; min-height: 110px;
  font-size: 14px; font-family: inherit; color: #0F172A;
  border: 1.5px solid #E2E8F0; border-radius: 12px; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s; line-height: 1.6;
}
.ta-modal-ta:focus { border-color: #059669; box-shadow: 0 0 0 4px rgba(5,150,105,0.08); }
.ta-modal-ta.err   { border-color: #FCA5A5; }
.ta-modal-err      { font-size: 12px; color: #DC2626; margin-top: 4px; }
.ta-modal-info {
  font-size: 13px; color: #64748B; background: #F8FAFC;
  border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; line-height: 1.6;
}
.ta-modal-info strong { color: #0F172A; }
.ta-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
`;