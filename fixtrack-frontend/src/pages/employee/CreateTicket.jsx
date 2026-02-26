// src/pages/employee/CreerTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tickets } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

import Badge          from "../../components/common/Badge";
import Button         from "../../components/common/Button";
import Modal          from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Back: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Next: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CheckLg: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Pin: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Phone: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
    </svg>
  ),
  Image: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  File: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Droplet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Wind: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  Monitor: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Armchair: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z"/>
      <line x1="5" y1="18" x2="5" y2="21"/>
      <line x1="19" y1="18" x2="19" y2="21"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69H21l-4.94 3.58a1 1 0 0 0-.36 1.12L17.56 20 12 16.24 6.44 20l1.86-5.85a1 1 0 0 0-.36-1.12L3 9.45h6.17a1 1 0 0 0 .95-.69z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  MoreCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "Électrique",          IcoComp: Icon.Zap        },
  { value: "Plomberie",           IcoComp: Icon.Droplet    },
  { value: "HVAC",                IcoComp: Icon.Wind       },
  { value: "Informatique",        IcoComp: Icon.Monitor    },
  { value: "Menuiserie/Mobilier", IcoComp: Icon.Armchair   },
  { value: "Hygiène/Nettoyage",   IcoComp: Icon.Sparkles   },
  { value: "Sécurité",            IcoComp: Icon.Shield     },
  { value: "Mécanique",           IcoComp: Icon.Settings   },
  { value: "Autre",               IcoComp: Icon.MoreCircle },
];

const LOC_SUGGESTIONS = [
  "Bâtiment A","Bâtiment B","Bâtiment C",
  "Étage 1","Étage 2","RDC","Sous-sol",
  "Salle de réunion","Couloir","Parking",
  "Cafétéria","Accueil","Terrasse",
];

const URGENCES = [
  { value:"critical", label:"Activité arrêtée",  desc:"Travail complètement bloqué",    color:"#DC2626", bg:"#FEF2F2", border:"#FCA5A5", dot:"#EF4444" },
  { value:"high",     label:"Activité ralentie", desc:"Travail difficile mais possible", color:"#D97706", bg:"#FFFBEB", border:"#FCD34D", dot:"#F59E0B" },
  { value:"medium",   label:"Activité normale",  desc:"Problème gênant non bloquant",   color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", dot:"#10B981" },
  { value:"low",      label:"Peu urgent",         desc:"À traiter quand possible",        color:"#6B7280", bg:"#F9FAFB", border:"#D1D5DB", dot:"#9CA3AF" },
];

const STEPS = [
  { id: 0, label: "Problème",    short: "Description du problème"   },
  { id: 1, label: "Localisation",short: "Où et quelle catégorie"    },
  { id: 2, label: "Urgence",     short: "Niveau de priorité"         },
  { id: 3, label: "Contact",     short: "Vos coordonnées"            },
  { id: 4, label: "Récapitulatif",short: "Vérification finale"       },
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');

.wz *, .wz *::before, .wz *::after { box-sizing: border-box; }
.wz { font-family: 'DM Sans', sans-serif; color: #0F172A; }

/* ── Layout principal ── */
.wz-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 64px);
  gap: 0;
}
@media(max-width: 768px) {
  .wz-layout { grid-template-columns: 1fr; }
  .wz-sidebar { display: none; }
}

/* ── Sidebar steps ── */
.wz-sidebar {
  background: #fff;
  border-right: 1px solid #E2E8F0;
  padding: 32px 24px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
.wz-sidebar-title {
  font-size: 11px; font-weight: 700;
  color: #94A3B8; text-transform: uppercase;
  letter-spacing: 0.1em; margin-bottom: 24px;
}
.wz-step-item {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 12px 0; cursor: default;
  border-bottom: 1px solid #F1F5F9;
  transition: all 0.2s;
}
.wz-step-item:last-child { border-bottom: none; }
.wz-step-bullet {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  transition: all 0.25s;
  margin-top: 1px;
}
.wz-step-bullet.done {
  background: #059669; color: #fff;
  box-shadow: 0 2px 8px rgba(5,150,105,0.25);
}
.wz-step-bullet.active {
  background: #2563EB; color: #fff;
  box-shadow: 0 2px 12px rgba(37,99,235,0.30);
}
.wz-step-bullet.idle {
  background: #F1F5F9; color: #94A3B8;
  border: 1.5px solid #E2E8F0;
}
.wz-step-text {}
.wz-step-label {
  font-size: 13px; font-weight: 600;
  transition: color 0.2s;
}
.wz-step-label.active { color: #2563EB; }
.wz-step-label.done   { color: #059669; }
.wz-step-label.idle   { color: #94A3B8; }
.wz-step-desc {
  font-size: 11px; color: #CBD5E1; margin-top: 2px;
}
.wz-step-desc.active { color: #93C5FD; }
.wz-step-desc.done   { color: #6EE7B7; }

/* ── Main content ── */
.wz-main {
  padding: 40px 48px 80px;
  max-width: 680px;
}
@media(max-width: 1024px) { .wz-main { padding: 32px 32px 60px; } }
@media(max-width: 640px)  { .wz-main { padding: 24px 18px 60px; max-width: 100%; } }

/* ── Step header ── */
.wz-step-header { margin-bottom: 32px; }
.wz-step-eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: #2563EB;
  margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
}
.wz-step-eyebrow::before {
  content:''; display:block; width:16px; height:2px;
  background:#2563EB; border-radius:2px;
}
.wz-step-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 400; color: #0F172A;
  letter-spacing: -0.02em; line-height: 1.2;
  margin: 0 0 8px;
}
.wz-step-subtitle {
  font-size: 14px; color: #64748B; line-height: 1.6; margin: 0;
}

/* ── Progress bar (mobile) ── */
.wz-mobile-progress {
  display: none;
  margin-bottom: 24px;
}
@media(max-width: 768px) { .wz-mobile-progress { display: block; } }
.wz-mobile-steps {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.wz-mobile-step-dot {
  width: 8px; height: 8px; border-radius: 50%;
  transition: all 0.2s;
}
.wz-mobile-step-dot.done   { background: #059669; }
.wz-mobile-step-dot.active { background: #2563EB; width: 24px; border-radius: 4px; }
.wz-mobile-step-dot.idle   { background: #E2E8F0; }
.wz-mobile-label { font-size: 12px; color: #64748B; }
.wz-mobile-label span { font-weight: 600; color: #2563EB; }

/* ── Fields ── */
.wz-field { display: flex; flex-direction: column; gap: 6px; }
.wz-label {
  font-size: 11px; font-weight: 700; color: #475569;
  letter-spacing: 0.05em; text-transform: uppercase;
}
.wz-label-note { font-size: 11px; font-weight: 400; color: #94A3B8; text-transform: none; letter-spacing: 0; margin-left: 6px; }
.wz-req { color: #DC2626; }

.wz-in, .wz-ta {
  width: 100%; padding: 13px 16px;
  font-size: 14px; font-family: inherit; color: #0F172A;
  background: #fff; border: 1.5px solid #E2E8F0;
  border-radius: 12px; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  line-height: 1.5;
}
.wz-ta { resize: vertical; min-height: 120px; }
.wz-in:focus, .wz-ta:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
}
.wz-in.err { border-color: #FCA5A5; box-shadow: 0 0 0 4px rgba(220,38,38,0.06); }
.wz-ta.err { border-color: #FCA5A5; box-shadow: 0 0 0 4px rgba(220,38,38,0.06); }
.wz-in.ico { padding-left: 42px; }

.wz-iw  { position: relative; }
.wz-ico {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #94A3B8; pointer-events: none; display: flex; align-items: center;
}

/* field footer */
.wz-ff  { display: flex; justify-content: space-between; align-items: center; }
.wz-cnt { font-size: 11px; color: #94A3B8; margin-left: auto; }
.wz-pw  { display: flex; align-items: center; gap: 8px; }
.wz-pb  { width: 56px; height: 3px; border-radius: 2px; background: #E2E8F0; overflow: hidden; }
.wz-pf  { height: 100%; border-radius: 2px; transition: width 0.25s, background-color 0.25s; }

/* error */
.wz-err { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #DC2626; }

/* suggestions */
.wz-sugg {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 100;
  background: #fff; border: 1.5px solid #2563EB;
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(15,23,42,0.12);
  animation: wzFade 0.14s ease;
}
@keyframes wzFade {
  from { opacity:0; transform:translateY(-4px); }
  to   { opacity:1; transform:translateY(0); }
}
.wz-si {
  width: 100%; padding: 10px 16px; text-align: left;
  border: none; background: transparent; cursor: pointer;
  font-size: 13px; color: #0F172A; font-family: inherit;
  display: flex; align-items: center; gap: 10px;
  transition: background 0.12s; border-bottom: 1px solid #F1F5F9;
}
.wz-si:last-child { border-bottom: none; }
.wz-si:hover { background: #EFF6FF; color: #2563EB; }

/* categories */
.wz-cg {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
@media(max-width: 480px) { .wz-cg { grid-template-columns: repeat(2, 1fr); } }
.wz-cb {
  padding: 14px 12px; border-radius: 12px;
  border: 1.5px solid #E2E8F0; background: #fff;
  cursor: pointer; font-family: inherit;
  font-size: 13px; font-weight: 500; color: #475569;
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; transition: all 0.18s; text-align: center;
}
.wz-cb:hover {
  border-color: #BFDBFE; background: #F0F7FF; color: #1D4ED8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.10);
}
.wz-cb.on {
  border-color: #2563EB; background: #EFF6FF; color: #2563EB;
  font-weight: 600; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  transform: translateY(-2px);
}
.wz-cb-ico {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #F1F5F9; transition: background 0.18s;
}
.wz-cb:hover .wz-cb-ico { background: #DBEAFE; }
.wz-cb.on   .wz-cb-ico  { background: #DBEAFE; }

/* urgence */
.wz-ul { display: flex; flex-direction: column; gap: 10px; }
.wz-uc {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-radius: 14px; cursor: pointer;
  border: 1.5px solid #E2E8F0; background: #fff;
  transition: all 0.18s; user-select: none;
}
.wz-uc:hover { transform: translateX(3px); box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.wz-ur { display: none; }
.wz-udot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid currentColor; position: relative; transition: all 0.18s;
}
.wz-udot.on::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 7px; height: 7px; border-radius: 50%; background: currentColor;
}
.wz-ui { flex: 1; }
.wz-un { font-size: 14px; font-weight: 600; }
.wz-ud { font-size: 12px; color: #94A3B8; margin-top: 2px; }

/* contact card */
.wz-cc {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; border-radius: 14px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
}
.wz-av {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg,#2563EB,#1D4ED8);
  color: #fff; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(37,99,235,0.25);
}
.wz-av-n { font-size: 14px; font-weight: 600; color: #0F172A; }
.wz-av-e { font-size: 12px; color: #94A3B8; margin-top: 2px; }
.wz-role {
  margin-left: auto; padding: 4px 12px; border-radius: 20px;
  font-size: 11px; font-weight: 600; text-transform: capitalize;
  background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;
}

/* photo */
.wz-pz {
  border: 2px dashed #CBD5E1; border-radius: 14px;
  padding: 36px 24px; text-align: center;
  background: #F8FAFC; cursor: pointer; transition: all 0.18s;
}
.wz-pz:hover, .wz-pz.on { border-color: #2563EB; background: #EFF6FF; }
.wz-pico {
  width: 52px; height: 52px; border-radius: 14px;
  background: #E2E8F0; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; color: #94A3B8; transition: all 0.18s;
}
.wz-pz:hover .wz-pico, .wz-pz.on .wz-pico { background: #BFDBFE; color: #2563EB; }
.wz-pt { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
.wz-ps { font-size: 12px; color: #94A3B8; }
.wz-pl { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.wz-pi {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
  font-size: 13px; color: #475569;
}
.wz-pn  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wz-psz { font-size: 11px; color: #94A3B8; flex-shrink: 0; }

/* ── Récap (étape 4) ── */
.wz-recap {
  display: flex; flex-direction: column; gap: 16px;
}
.wz-recap-block {
  background: #fff; border: 1px solid #E2E8F0;
  border-radius: 14px; overflow: hidden;
}
.wz-recap-head {
  padding: 12px 18px; background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 11px; font-weight: 700; color: #64748B;
  text-transform: uppercase; letter-spacing: 0.07em;
}
.wz-recap-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.wz-recap-row  { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.wz-recap-lbl  { font-size: 13px; color: #94A3B8; font-weight: 500; flex-shrink: 0; }
.wz-recap-val  { font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; }
.wz-recap-edit {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #2563EB; font-weight: 500;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 4px 8px;
  border-radius: 6px; transition: background 0.15s;
  flex-shrink: 0;
}
.wz-recap-edit:hover { background: #EFF6FF; }

/* ── Navigation footer ── */
.wz-nav {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 40px; padding-top: 24px;
  border-top: 1px solid #F1F5F9;
}
.wz-nav-btn-back {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 10px;
  border: 1.5px solid #E2E8F0; background: #fff;
  color: #475569; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.18s;
}
.wz-nav-btn-back:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }
.wz-nav-btn-next {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 24px; border-radius: 10px;
  border: none; background: #2563EB;
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.18s;
  box-shadow: 0 2px 12px rgba(37,99,235,0.30);
}
.wz-nav-btn-next:hover { background: #1D4ED8; box-shadow: 0 4px 20px rgba(37,99,235,0.40); transform: translateY(-1px); }
.wz-nav-btn-next:disabled { background: #94A3B8; box-shadow: none; cursor: not-allowed; transform: none; }
.wz-nav-btn-submit {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 28px; border-radius: 10px;
  border: none; background: #059669;
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.18s;
  box-shadow: 0 2px 12px rgba(5,150,105,0.30);
}
.wz-nav-btn-submit:hover { background: #047857; box-shadow: 0 4px 20px rgba(5,150,105,0.40); transform: translateY(-1px); }

/* ── Success screen ── */
.wz-success {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 24px;
  text-align: center;
  animation: wzSlide 0.5s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzSlide {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
.wz-success-ring {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg,#059669,#047857);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(5,150,105,0.30);
}
.wz-success-title {
  font-family: 'DM Serif Display', serif;
  font-size: 28px; font-weight: 400; color: #0F172A;
  margin-bottom: 12px;
}
.wz-success-sub { font-size: 15px; color: #64748B; margin-bottom: 32px; line-height: 1.6; }

/* ── Field groups (spacing) ── */
.wz-fields { display: flex; flex-direction: column; gap: 24px; }

/* ── Animations step transition ── */
.wz-step-anim {
  animation: wzStep 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzStep {
  from { opacity:0; transform:translateX(16px); }
  to   { opacity:1; transform:translateX(0); }
}
.wz-step-anim-back {
  animation: wzStepBack 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzStepBack {
  from { opacity:0; transform:translateX(-16px); }
  to   { opacity:1; transform:translateX(0); }
}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function FieldLabel({ htmlFor, label, req, note }) {
  return (
    <label htmlFor={htmlFor} className="wz-label">
      {label}
      {req && <span className="wz-req"> *</span>}
      {note && <span className="wz-label-note">{note}</span>}
    </label>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <div className="wz-err">
      <Icon.AlertCircle />
      {msg}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ current }) {
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
            <div className="wz-step-text">
              <div className={`wz-step-label ${st}`}>{s.label}</div>
              <div className={`wz-step-desc ${st}`}>{s.short}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

// ── Mobile progress ───────────────────────────────────────────────────────────
function MobileProgress({ current }) {
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function CreateTicket() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [step, setStep]     = useState(0);
  const [dir,  setDir]      = useState("next"); // animation direction
  const [form, setForm]     = useState({
    titre:"", description:"",
    localisation:"", categorie:"", categorieAutre:"",
    urgence:"medium",
    telephone:"", photos:[],
  });
  const [errors,   setErrors]   = useState({});
  const [focused,  setFocused]  = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const set = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors(prev => { const n = {...prev}; delete n[f]; return n; });
  };

  const filteredSugg = LOC_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(form.localisation.toLowerCase()) && form.localisation.length > 0
  );

  // ── Validation par étape ──────────────────────────────────────────────────
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.titre.trim())                e.titre       = "Le titre est obligatoire.";
      else if (form.titre.trim().length < 5) e.titre       = "Minimum 5 caractères.";
      if (!form.description.trim())          e.description = "La description est obligatoire.";
      else if (form.description.trim().length < 20)
        e.description = `${form.description.trim().length}/20 caractères minimum.`;
    }
    if (s === 1) {
      if (!form.localisation.trim()) e.localisation = "La localisation est obligatoire.";
      if (!form.categorie)           e.categorie    = "Veuillez choisir une catégorie.";
      if (form.categorie === "Autre" && !form.categorieAutre.trim())
        e.categorieAutre = "Précisez la catégorie.";
    }
    if (s === 3) {
      if (form.telephone && !/^[+\d\s\-()]{6,20}$/.test(form.telephone))
        e.telephone = "Numéro invalide.";
    }
    return e;
  };

  const goNext = () => {
    const errs = validateStep(step);
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
      ? `Autre — ${form.categorieAutre.trim()}` : form.categorie;
    tickets.push({
      id:          `t${Date.now()}`,
      titre:        form.titre.trim(),
      description:  form.description.trim(),
      statut:       "open",
      priorite:     form.urgence,
      categorie:    cat,
      localisation: form.localisation.trim(),
      auteurId:     user?.id || user?.email || "u1",
      auteurTel:    form.telephone.trim() || null,
      technicienId: null,
      dateCreation: new Date().toISOString().split("T")[0],
      notes:        [],
    });
    setLoading(false);
    setSuccess(true);
  };

  const dLen    = form.description.trim().length;
  const animCls = dir === "next" ? "wz-step-anim" : "wz-step-anim-back";

  if (loading) return <LoadingSpinner size={48} />;

  // ── Écran succès ──────────────────────────────────────────────────────────
  if (success) {
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
                Votre signalement a bien été enregistré.<br/>
                Un technicien sera assigné dès que possible.
              </p>
              <Badge status="open" />
              <div style={{marginTop:32, display:"flex", gap:12}}>
                <button
                  onClick={() => navigate("/employee/tickets")}
                  className="wz-nav-btn-next">
                  Voir mes tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Contenu par étape ─────────────────────────────────────────────────────
  const renderStep = () => {
    switch(step) {

      // ── Étape 0 : Identification ──────────────────────────────────────────
      case 0:
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
                <input id="titre" type="text"
                  className={`wz-in${errors.titre?" err":""}`}
                  placeholder="Ex. : Fuite d'eau au plafond, Panne de chauffage…"
                  value={form.titre} maxLength={100}
                  onChange={e => set("titre", e.target.value)}
                  onFocus={() => setFocused("titre")} onBlur={() => setFocused("")}
                  autoFocus
                />
                <div className="wz-ff">
                  <Err msg={errors.titre} />
                  <span className="wz-cnt">{form.titre.length}/100</span>
                </div>
              </div>

              <div className="wz-field">
                <FieldLabel htmlFor="desc" label="Description" req note="— minimum 20 caractères" />
                <textarea id="desc"
                  className={`wz-ta${errors.description?" err":""}`}
                  placeholder="Décrivez le problème : depuis quand, symptômes observés, tentatives effectuées…"
                  value={form.description} rows={5} maxLength={500}
                  onChange={e => set("description", e.target.value)}
                  onFocus={() => setFocused("desc")} onBlur={() => setFocused("")}
                />
                <div className="wz-ff">
                  <Err msg={errors.description} />
                  <div className="wz-pw">
                    <div className="wz-pb">
                      <div className="wz-pf" style={{
                        width:`${Math.min((dLen/20)*100,100)}%`,
                        background: dLen>=20 ? "#059669" : "#2563EB",
                      }}/>
                    </div>
                    <span className="wz-cnt" style={{color: dLen>=20?"#059669":"#94A3B8"}}>
                      {dLen}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ── Étape 1 : Localisation & Catégorie ───────────────────────────────
      case 1:
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
              <div className="wz-field">
                <FieldLabel htmlFor="loc" label="Localisation" req note="— où se trouve le problème ?" />
                <div className="wz-iw">
                  <span className="wz-ico"><Icon.Pin /></span>
                  <input id="loc" type="text"
                    className={`wz-in ico${errors.localisation?" err":""}`}
                    placeholder="Ex. : Bâtiment B — Salle 12, Chambre 204…"
                    value={form.localisation} maxLength={100}
                    onChange={e => { set("localisation", e.target.value); setShowSugg(true); }}
                    onFocus={() => { setFocused("loc"); setShowSugg(true); }}
                    onBlur={() => { setFocused(""); setTimeout(() => setShowSugg(false), 150); }}
                    autoFocus
                  />
                  {showSugg && filteredSugg.length > 0 && (
                    <div className="wz-sugg">
                      {filteredSugg.map((s, i) => (
                        <button key={i} type="button" className="wz-si"
                          onMouseDown={() => { set("localisation", s); setShowSugg(false); }}>
                          <span style={{color:"#2563EB",display:"flex",flexShrink:0}}><Icon.Pin /></span>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Err msg={errors.localisation} />
              </div>

              <div className="wz-field">
                <FieldLabel label="Catégorie du problème" req />
                <div className="wz-cg">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.IcoComp;
                    return (
                      <button key={cat.value} type="button"
                        className={`wz-cb${form.categorie===cat.value?" on":""}`}
                        onClick={() => {
                          set("categorie", cat.value);
                          if (cat.value !== "Autre") set("categorieAutre","");
                        }}>
                        <span className="wz-cb-ico"><CatIcon /></span>
                        <span>{cat.value}</span>
                      </button>
                    );
                  })}
                </div>
                <Err msg={errors.categorie} />

                {form.categorie === "Autre" && (
                  <div style={{marginTop:14}} className="wz-field">
                    <FieldLabel htmlFor="cat-a" label="Précisez la catégorie" req />
                    <input id="cat-a" type="text" autoFocus
                      className={`wz-in${errors.categorieAutre?" err":""}`}
                      placeholder="Ex. : Ascenseur, Signalétique, Jardinage…"
                      value={form.categorieAutre} maxLength={60}
                      onChange={e => set("categorieAutre", e.target.value)}
                    />
                    <Err msg={errors.categorieAutre} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ── Étape 2 : Urgence ─────────────────────────────────────────────────
      case 2:
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
                  style={form.urgence===u.value ? {borderColor:u.border, background:u.bg} : {}}>
                  <input type="radio" id={`urg-${u.value}`} name="urgence"
                    value={u.value} className="wz-ur"
                    checked={form.urgence===u.value}
                    onChange={() => set("urgence", u.value)} />
                  <span className={`wz-udot${form.urgence===u.value?" on":""}`} style={{color:u.dot}} />
                  <div className="wz-ui">
                    <div className="wz-un" style={{color:form.urgence===u.value?u.color:"#0F172A"}}>{u.label}</div>
                    <div className="wz-ud">{u.desc}</div>
                  </div>
                  <Badge status={u.value} />
                </label>
              ))}
            </div>
          </div>
        );

      // ── Étape 3 : Contact ─────────────────────────────────────────────────
      case 3:
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
                      ? user.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()
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
                    className={`wz-in ico${errors.telephone?" err":""}`}
                    placeholder="Ex. : +216 XX XXX XXX"
                    value={form.telephone} maxLength={20}
                    onChange={e => set("telephone", e.target.value)}
                    onFocus={() => setFocused("tel")} onBlur={() => setFocused("")}
                  />
                </div>
                <Err msg={errors.telephone} />
              </div>

              <div className="wz-field">
                <FieldLabel label="Photos" note="— optionnel" />
                <label style={{display:"block",cursor:"pointer"}}>
                  <div className={`wz-pz${focused==="photos"?" on":""}`}>
                    <div className="wz-pico"><Icon.Image /></div>
                    <div className="wz-pt">
                      {form.photos.length > 0
                        ? `${form.photos.length} fichier${form.photos.length>1?"s":""} sélectionné${form.photos.length>1?"s":""}`
                        : "Glissez vos photos ou cliquez pour parcourir"}
                    </div>
                    <div className="wz-ps">PNG, JPG, WEBP — max 5 Mo</div>
                  </div>
                  <input type="file" accept="image/*" multiple style={{display:"none"}}
                    onChange={e => set("photos", Array.from(e.target.files||[]))}
                    onFocus={() => setFocused("photos")} onBlur={() => setFocused("")}
                  />
                </label>
                {form.photos.length > 0 && (
                  <div className="wz-pl">
                    {form.photos.map((f,i) => (
                      <div key={i} className="wz-pi">
                        <Icon.File />
                        <span className="wz-pn">{f.name}</span>
                        <span className="wz-psz">{(f.size/1024).toFixed(0)} Ko</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ── Étape 4 : Récapitulatif ───────────────────────────────────────────
      case 4:
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
              {/* Bloc 1 : Problème */}
              <div className="wz-recap-block">
                <div className="wz-recap-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  Problème
                  <button className="wz-recap-edit" onClick={() => { setDir("back"); setStep(0); }}>
                    Modifier
                  </button>
                </div>
                <div className="wz-recap-body">
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Titre</span>
                    <span className="wz-recap-val">{form.titre}</span>
                  </div>
                  <div style={{height:1,background:"#F1F5F9"}}/>
                  <div>
                    <span className="wz-recap-lbl" style={{display:"block",marginBottom:6}}>Description</span>
                    <p style={{fontSize:13,color:"#0F172A",lineHeight:1.6,margin:0}}>{form.description}</p>
                  </div>
                </div>
              </div>

              {/* Bloc 2 : Localisation */}
              <div className="wz-recap-block">
                <div className="wz-recap-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  Localisation & Catégorie
                  <button className="wz-recap-edit" onClick={() => { setDir("back"); setStep(1); }}>
                    Modifier
                  </button>
                </div>
                <div className="wz-recap-body">
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Localisation</span>
                    <span className="wz-recap-val">{form.localisation}</span>
                  </div>
                  <div style={{height:1,background:"#F1F5F9"}}/>
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Catégorie</span>
                    <span className="wz-recap-val">
                      {form.categorie==="Autre" ? `Autre — ${form.categorieAutre}` : form.categorie}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloc 3 : Urgence */}
              <div className="wz-recap-block">
                <div className="wz-recap-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  Urgence
                  <button className="wz-recap-edit" onClick={() => { setDir("back"); setStep(2); }}>
                    Modifier
                  </button>
                </div>
                <div className="wz-recap-body">
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Priorité</span>
                    <Badge status={form.urgence} />
                  </div>
                  <div style={{height:1,background:"#F1F5F9"}}/>
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Niveau</span>
                    <span className="wz-recap-val">
                      {URGENCES.find(u=>u.value===form.urgence)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloc 4 : Contact */}
              <div className="wz-recap-block">
                <div className="wz-recap-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  Contact
                  <button className="wz-recap-edit" onClick={() => { setDir("back"); setStep(3); }}>
                    Modifier
                  </button>
                </div>
                <div className="wz-recap-body">
                  <div className="wz-recap-row">
                    <span className="wz-recap-lbl">Déclarant</span>
                    <span className="wz-recap-val">{user?.nom || user?.email || "—"}</span>
                  </div>
                  {form.telephone && <>
                    <div style={{height:1,background:"#F1F5F9"}}/>
                    <div className="wz-recap-row">
                      <span className="wz-recap-lbl">Téléphone</span>
                      <span className="wz-recap-val">{form.telephone}</span>
                    </div>
                  </>}
                  {form.photos.length > 0 && <>
                    <div style={{height:1,background:"#F1F5F9"}}/>
                    <div className="wz-recap-row">
                      <span className="wz-recap-lbl">Photos</span>
                      <span className="wz-recap-val">{form.photos.length} fichier{form.photos.length>1?"s":""}</span>
                    </div>
                  </>}
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="wz">
      <style>{CSS}</style>
      <div className="wz-layout">

        {/* Sidebar */}
        <Sidebar current={step} />

        {/* Main */}
        <div className="wz-main">
          <MobileProgress current={step} />

          {renderStep()}

          {/* Navigation */}
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