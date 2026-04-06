// src/pages/user/create-ticket/Wizardstyles.js

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');

.wz *, .wz *::before, .wz *::after { box-sizing: border-box; }
.wz { font-family: 'DM Sans', sans-serif; color: #0F172A; background: #F8FAFC; min-height: 100vh; }

/* ═══════════════════════════════════════════
   HORIZONTAL STEPPER
═══════════════════════════════════════════ */
.wz-stepper {
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  padding: 0 40px;
  position: sticky;
  top: 64px;
  z-index: 10;
}
.wz-stepper-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 760px;
  margin: 0 auto;
  height: 72px;
}
.wz-step-item {
  display: flex;
  align-items: center;
  flex: 1;
}
.wz-step-item:last-child { flex: 0; }

.wz-step-connector {
  flex: 1;
  height: 2px;
  background: #E2E8F0;
  transition: background 0.35s;
  margin: 0 4px;
}
.wz-step-connector.done { background: #059669; }

.wz-step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: default;
  font-family: inherit;
  flex-shrink: 0;
}
.wz-step-circle {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  border: 2px solid #E2E8F0;
  background: #fff; color: #94A3B8;
  transition: all 0.25s;
}
.wz-step-circle.done   { background:#059669; border-color:#059669; color:#fff; box-shadow:0 2px 8px rgba(5,150,105,.3); }
.wz-step-circle.active { background:#2563EB; border-color:#2563EB; color:#fff; box-shadow:0 2px 12px rgba(37,99,235,.35); }

.wz-step-name {
  font-size: 11px; font-weight: 600; color: #94A3B8;
  text-transform: uppercase; letter-spacing: 0.06em;
  white-space: nowrap; transition: color 0.2s;
}
.wz-step-name.done   { color: #059669; }
.wz-step-name.active { color: #2563EB; }

/* mobile stepper — circles only + label strip below */
@media(max-width: 600px) {
  .wz-stepper { padding: 0 16px; }
  .wz-stepper-inner { height: 52px; }
  .wz-step-name { display: none; }
  .wz-step-circle { width: 26px; height: 26px; font-size: 11px; }
  .wz-step-connector { margin: 0 2px; }
}

.wz-stepper-label {
  display: none;
  text-align: center;
  font-size: 12px; color: #64748B;
  padding: 5px 16px 9px;
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
}
.wz-stepper-label span { font-weight: 700; color: #2563EB; }
@media(max-width: 600px) { .wz-stepper-label { display: block; } }

/* ═══════════════════════════════════════════
   PAGE LAYOUT
═══════════════════════════════════════════ */
.wz-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  max-width: 1160px;
  margin: 0 auto;
  padding: 40px 40px 80px;
  align-items: start;
}

/* tablet — hide AI panel, single column */
@media(max-width: 1024px) {
  .wz-layout {
    grid-template-columns: 1fr;
    padding: 28px 24px 64px;
  }
  .wz-ai-panel { display: none; }
}

/* mobile — flush edges, no card border-radius */
@media(max-width: 600px) {
  .wz-layout { padding: 0 0 72px; }
}

/* ═══════════════════════════════════════════
   FORM CARD
═══════════════════════════════════════════ */
.wz-main {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 40px 40px 32px;
  box-shadow: 0 2px 16px rgba(15,23,42,.04);
}
@media(max-width: 768px) { .wz-main { padding: 28px 28px 28px; } }
@media(max-width: 600px) {
  .wz-main {
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    padding: 24px 18px 28px;
    box-shadow: none;
  }
}

/* ═══════════════════════════════════════════
   AI PANEL
═══════════════════════════════════════════ */
.wz-ai-panel {
  position: sticky;
  top: calc(64px + 72px + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 0;
}

.wz-ai-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15,23,42,.04);
}
.wz-ai-card-head {
  padding: 14px 18px 12px;
  border-bottom: 1px solid #F1F5F9;
  display: flex; align-items: center; gap: 8px;
}
.wz-ai-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 800;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #6366F1;
}
.wz-ai-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%; background: #6366F1;
  animation: wz-pulse 2s infinite;
}
@keyframes wz-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(1.3); }
}
.wz-ai-card-body { padding: 16px 18px; }
.wz-ai-priority-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.wz-ai-priority-label { font-size:11px; color:#94A3B8; font-weight:500; }
.wz-ai-score { display:flex; align-items:baseline; gap:2px; margin-bottom:6px; }
.wz-ai-score-num { font-family:'DM Serif Display',serif; font-size:36px; color:#0F172A; line-height:1; }
.wz-ai-score-max { font-size:14px; color:#CBD5E1; }
.wz-ai-bar { height:6px; background:#F1F5F9; border-radius:4px; overflow:hidden; margin-bottom:14px; }
.wz-ai-bar-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,#F59E0B,#F97316); transition:width .5s cubic-bezier(.16,1,.3,1); }
.wz-ai-metrics { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
.wz-ai-metric { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:10px; padding:10px 12px; }
.wz-ai-metric-lbl { font-size:9px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
.wz-ai-metric-val { font-size:14px; font-weight:700; color:#0F172A; }
.wz-ai-suggestion { background:#F0F7FF; border:1px solid #BFDBFE; border-radius:10px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
.wz-ai-suggestion-ico { color:#2563EB; flex-shrink:0; margin-top:1px; }
.wz-ai-suggestion-text { font-size:12px; color:#1E40AF; line-height:1.55; }
.wz-ai-footer { padding:10px 18px; border-top:1px solid #F1F5F9; font-size:11px; color:#94A3B8; display:flex; align-items:center; gap:5px; }
.wz-help-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; padding:18px; box-shadow:0 2px 12px rgba(15,23,42,.04); }
.wz-help-title { font-size:14px; font-weight:700; color:#0F172A; margin-bottom:6px; }
.wz-help-text  { font-size:12px; color:#64748B; line-height:1.55; margin-bottom:12px; }
.wz-help-link  { font-size:12px; font-weight:600; color:#2563EB; background:none; border:none; cursor:pointer; font-family:inherit; padding:0; display:flex; align-items:center; gap:5px; text-decoration:none; }
.wz-help-link:hover { text-decoration:underline; }
.wz-ai-placeholder { display:flex; flex-direction:column; align-items:center; padding:28px 18px; text-align:center; gap:10px; }
.wz-ai-placeholder-ico { width:44px; height:44px; border-radius:14px; background:#EEF2FF; display:flex; align-items:center; justify-content:center; color:#6366F1; }
.wz-ai-placeholder-text { font-size:13px; color:#94A3B8; line-height:1.5; }

/* ═══════════════════════════════════════════
   STEP HEADER
═══════════════════════════════════════════ */
.wz-step-header { margin-bottom: 28px; }
.wz-step-eyebrow {
  font-size:11px; font-weight:600; letter-spacing:.1em;
  text-transform:uppercase; color:#2563EB;
  margin-bottom:8px; display:flex; align-items:center; gap:8px;
}
.wz-step-eyebrow::before { content:''; display:block; width:16px; height:2px; background:#2563EB; border-radius:2px; }
.wz-step-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(20px,3vw,26px); font-weight:400; color:#0F172A;
  letter-spacing:-.02em; line-height:1.2; margin:0 0 8px;
}
.wz-step-subtitle { font-size:14px; color:#64748B; line-height:1.6; margin:0; }

/* ═══════════════════════════════════════════
   FIELDS
═══════════════════════════════════════════ */
.wz-fields { display:flex; flex-direction:column; gap:22px; }
.wz-field  { display:flex; flex-direction:column; gap:6px; }
.wz-label  { font-size:11px; font-weight:700; color:#475569; letter-spacing:.05em; text-transform:uppercase; }
.wz-label-note { font-size:11px; font-weight:400; color:#94A3B8; text-transform:none; letter-spacing:0; margin-left:6px; }
.wz-req { color:#DC2626; }

.wz-in, .wz-ta {
  width:100%; padding:13px 16px;
  font-size:14px; font-family:inherit; color:#0F172A;
  background:#fff; border:1.5px solid #E2E8F0;
  border-radius:12px; outline:none;
  transition:border-color .18s, box-shadow .18s;
  line-height:1.5;
}
.wz-ta { resize:vertical; min-height:120px; }
.wz-in:focus, .wz-ta:focus { border-color:#2563EB; box-shadow:0 0 0 4px rgba(37,99,235,.08); }
.wz-in.err { border-color:#FCA5A5; box-shadow:0 0 0 4px rgba(220,38,38,.06); }
.wz-ta.err { border-color:#FCA5A5; box-shadow:0 0 0 4px rgba(220,38,38,.06); }
.wz-in.ico { padding-left:42px; }
.wz-iw  { position:relative; }
.wz-ico { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; display:flex; align-items:center; }

.wz-ff  { display:flex; justify-content:space-between; align-items:center; }
.wz-cnt { font-size:11px; color:#94A3B8; margin-left:auto; }
.wz-pw  { display:flex; align-items:center; gap:8px; }
.wz-pb  { width:56px; height:3px; border-radius:2px; background:#E2E8F0; overflow:hidden; }
.wz-pf  { height:100%; border-radius:2px; transition:width .25s, background-color .25s; }
.wz-err { display:flex; align-items:center; gap:5px; font-size:12px; color:#DC2626; }

/* suggestions */
.wz-sugg { position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:100; background:#fff; border:1.5px solid #2563EB; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(15,23,42,.12); animation:wzFade .14s ease; }
@keyframes wzFade { from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)} }
.wz-si { width:100%; padding:10px 16px; text-align:left; border:none; background:transparent; cursor:pointer; font-size:13px; color:#0F172A; font-family:inherit; display:flex; align-items:center; gap:10px; transition:background .12s; border-bottom:1px solid #F1F5F9; }
.wz-si:last-child { border-bottom:none; }
.wz-si:hover { background:#EFF6FF; color:#2563EB; }

/* categories */
.wz-cg { display:grid; grid-template-columns:repeat(auto-fill, minmax(130px,1fr)); gap:10px; }
@media(max-width:480px) { .wz-cg { grid-template-columns:repeat(2,1fr); } }
.wz-cb { padding:14px 12px; border-radius:12px; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; font-family:inherit; font-size:13px; font-weight:500; color:#475569; display:flex; flex-direction:column; align-items:center; gap:8px; transition:all .18s; text-align:center; }
.wz-cb:hover { border-color:#BFDBFE; background:#F0F7FF; color:#1D4ED8; transform:translateY(-2px); box-shadow:0 6px 16px rgba(37,99,235,.10); }
.wz-cb.on { border-color:#2563EB; background:#EFF6FF; color:#2563EB; font-weight:600; box-shadow:0 0 0 3px rgba(37,99,235,.12); transform:translateY(-2px); }
.wz-cb-ico { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#F1F5F9; transition:background .18s; }
.wz-cb:hover .wz-cb-ico, .wz-cb.on .wz-cb-ico { background:#DBEAFE; }

/* urgence */
.wz-ul { display:flex; flex-direction:column; gap:10px; }
.wz-uc { display:flex; align-items:center; gap:16px; padding:16px 20px; border-radius:14px; cursor:pointer; border:1.5px solid #E2E8F0; background:#fff; transition:all .18s; user-select:none; }
.wz-uc:hover { transform:translateX(3px); box-shadow:0 2px 12px rgba(0,0,0,.06); }
@media(max-width:480px) { .wz-uc { padding:14px 14px; gap:12px; } }
.wz-ur { display:none; }
.wz-udot { width:16px; height:16px; border-radius:50%; flex-shrink:0; border:2px solid currentColor; position:relative; transition:all .18s; }
.wz-udot.on::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:7px; height:7px; border-radius:50%; background:currentColor; }
.wz-ui { flex:1; min-width:0; }
.wz-un { font-size:14px; font-weight:600; }
.wz-ud { font-size:12px; color:#94A3B8; margin-top:2px; }
@media(max-width:380px) { .wz-ud { display:none; } }

/* contact */
.wz-cc { display:flex; align-items:center; gap:14px; padding:16px 18px; border-radius:14px; background:#F8FAFC; border:1px solid #E2E8F0; flex-wrap:wrap; }
.wz-av { width:46px; height:46px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:#fff; font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(37,99,235,.25); }
.wz-av-n { font-size:14px; font-weight:600; color:#0F172A; }
.wz-av-e { font-size:12px; color:#94A3B8; margin-top:2px; }
.wz-role { margin-left:auto; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; text-transform:capitalize; background:#ECFDF5; color:#047857; border:1px solid #6EE7B7; }

/* photos */
.wz-pz { border:2px dashed #CBD5E1; border-radius:14px; padding:36px 24px; text-align:center; background:#F8FAFC; cursor:pointer; transition:all .18s; }
@media(max-width:480px) { .wz-pz { padding:24px 16px; } }
.wz-pz:hover, .wz-pz.on { border-color:#2563EB; background:#EFF6FF; }
.wz-pico { width:52px; height:52px; border-radius:14px; background:#E2E8F0; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; color:#94A3B8; transition:all .18s; }
.wz-pz:hover .wz-pico, .wz-pz.on .wz-pico { background:#BFDBFE; color:#2563EB; }
.wz-pt { font-size:14px; font-weight:600; color:#475569; margin-bottom:4px; }
.wz-ps { font-size:12px; color:#94A3B8; }
.wz-pl { margin-top:14px; display:flex; flex-direction:column; gap:8px; }
.wz-pi { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; background:#F8FAFC; border:1px solid #E2E8F0; font-size:13px; color:#475569; }
.wz-pn { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wz-psz { font-size:11px; color:#94A3B8; flex-shrink:0; }

/* recap */
.wz-recap { display:flex; flex-direction:column; gap:16px; }
.wz-recap-block { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; }
.wz-recap-head { padding:12px 18px; background:#F8FAFC; border-bottom:1px solid #E2E8F0; font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.07em; display:flex; justify-content:space-between; align-items:center; }
.wz-recap-body { padding:16px 18px; display:flex; flex-direction:column; gap:12px; }
.wz-recap-row  { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
.wz-recap-lbl  { font-size:13px; color:#94A3B8; font-weight:500; flex-shrink:0; }
.wz-recap-val  { font-size:13px; color:#0F172A; font-weight:600; text-align:right; }
.wz-recap-div  { height:1px; background:#F1F5F9; }
.wz-recap-edit { display:flex; align-items:center; gap:5px; font-size:12px; color:#2563EB; font-weight:500; background:none; border:none; cursor:pointer; font-family:inherit; padding:4px 8px; border-radius:6px; transition:background .15s; flex-shrink:0; }
.wz-recap-edit:hover { background:#EFF6FF; }

/* status pill */
.wz-status-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:.02em; background:#ECFDF5; color:#047857; border:1px solid #6EE7B7; }
.wz-status-dot  { width:5px; height:5px; border-radius:50%; background:#10B981; flex-shrink:0; }

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
.wz-nav {
  display:flex; justify-content:space-between; align-items:center;
  margin-top:36px; padding-top:24px;
  border-top:1px solid #F1F5F9;
  gap:12px;
}

/* on very small screens stack nav buttons full width */
@media(max-width:380px) {
  .wz-nav { flex-direction:column-reverse; gap:8px; }
  .wz-nav-btn-back, .wz-nav-btn-next, .wz-nav-btn-submit { width:100%; justify-content:center; }
}

.wz-nav-btn-back {
  display:flex; align-items:center; gap:6px;
  padding:10px 18px; border-radius:10px;
  border:1.5px solid #E2E8F0; background:#fff; color:#475569;
  font-size:14px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .18s;
}
.wz-nav-btn-back:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

.wz-nav-btn-next {
  display:flex; align-items:center; gap:8px;
  padding:11px 24px; border-radius:10px;
  border:none; background:#2563EB; color:#fff;
  font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s;
  box-shadow:0 2px 12px rgba(37,99,235,.30);
}
.wz-nav-btn-next:hover { background:#1D4ED8; box-shadow:0 4px 20px rgba(37,99,235,.40); transform:translateY(-1px); }

.wz-nav-btn-submit {
  display:flex; align-items:center; gap:8px;
  padding:11px 28px; border-radius:10px;
  border:none; background:#059669; color:#fff;
  font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s;
  box-shadow:0 2px 12px rgba(5,150,105,.30);
}
.wz-nav-btn-submit:hover { background:#047857; box-shadow:0 4px 20px rgba(5,150,105,.40); transform:translateY(-1px); }

/* ═══════════════════════════════════════════
   SUCCESS
═══════════════════════════════════════════ */
.wz-success { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; text-align:center; animation:wzSlide .5s cubic-bezier(.16,1,.3,1); }
@keyframes wzSlide { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
.wz-success-ring { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#059669,#047857); display:flex; align-items:center; justify-content:center; margin-bottom:24px; box-shadow:0 8px 32px rgba(5,150,105,.30); }
.wz-success-title { font-family:'DM Serif Display',serif; font-size:28px; font-weight:400; color:#0F172A; margin-bottom:12px; }
.wz-success-sub   { font-size:15px; color:#64748B; margin-bottom:28px; line-height:1.6; }

/* ═══════════════════════════════════════════
   STEP ANIMATIONS
═══════════════════════════════════════════ */
.wz-step-anim      { animation:wzStep     .3s cubic-bezier(.16,1,.3,1); }
.wz-step-anim-back { animation:wzStepBack .3s cubic-bezier(.16,1,.3,1); }
@keyframes wzStep     { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
@keyframes wzStepBack { from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)} }

/* mobile progress (hidden on desktop, shown on mobile as part of stepper) */
.wz-mobile-progress { display:none; }
`;
