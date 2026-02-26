// src/pages/employee/CreateTicket/wizardStyles.js

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');

.wz *, .wz *::before, .wz *::after { box-sizing: border-box; }
.wz { font-family: 'DM Sans', sans-serif; color: #0F172A; }

/* ── Layout ── */
.wz-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 64px);
}
@media(max-width: 768px) {
  .wz-layout { grid-template-columns: 1fr; }
  .wz-sidebar { display: none; }
}

/* ── Sidebar ── */
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
  padding: 12px 0;
  border-bottom: 1px solid #F1F5F9;
}
.wz-step-item:last-child { border-bottom: none; }
.wz-step-bullet {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; margin-top: 1px;
  transition: all 0.25s;
}
.wz-step-bullet.done   { background: #059669; color: #fff; box-shadow: 0 2px 8px rgba(5,150,105,0.25); }
.wz-step-bullet.active { background: #2563EB; color: #fff; box-shadow: 0 2px 12px rgba(37,99,235,0.30); }
.wz-step-bullet.idle   { background: #F1F5F9; color: #94A3B8; border: 1.5px solid #E2E8F0; }
.wz-step-label { font-size: 13px; font-weight: 600; transition: color 0.2s; }
.wz-step-label.active { color: #2563EB; }
.wz-step-label.done   { color: #059669; }
.wz-step-label.idle   { color: #94A3B8; }
.wz-step-desc { font-size: 11px; color: #CBD5E1; margin-top: 2px; }
.wz-step-desc.active { color: #93C5FD; }
.wz-step-desc.done   { color: #6EE7B7; }

/* ── Main ── */
.wz-main { padding: 40px 48px 80px; max-width: 680px; }
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
  content: ''; display: block; width: 16px; height: 2px;
  background: #2563EB; border-radius: 2px;
}
.wz-step-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 400; color: #0F172A;
  letter-spacing: -0.02em; line-height: 1.2;
  margin: 0 0 8px;
}
.wz-step-subtitle { font-size: 14px; color: #64748B; line-height: 1.6; margin: 0; }

/* ── Mobile progress ── */
.wz-mobile-progress { display: none; margin-bottom: 24px; }
@media(max-width: 768px) { .wz-mobile-progress { display: block; } }
.wz-mobile-steps {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.wz-mobile-step-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.2s; }
.wz-mobile-step-dot.done   { background: #059669; }
.wz-mobile-step-dot.active { background: #2563EB; width: 24px; border-radius: 4px; }
.wz-mobile-step-dot.idle   { background: #E2E8F0; }
.wz-mobile-label { font-size: 12px; color: #64748B; }
.wz-mobile-label span { font-weight: 600; color: #2563EB; }

/* ── Fields ── */
.wz-fields { display: flex; flex-direction: column; gap: 24px; }
.wz-field  { display: flex; flex-direction: column; gap: 6px; }
.wz-label  {
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
.wz-in:focus, .wz-ta:focus { border-color: #2563EB; box-shadow: 0 0 0 4px rgba(37,99,235,0.08); }
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

.wz-err { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #DC2626; }

/* ── Suggestions dropdown ── */
.wz-sugg {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 100;
  background: #fff; border: 1.5px solid #2563EB;
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(15,23,42,0.12);
  animation: wzFade 0.14s ease;
}
@keyframes wzFade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
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

/* ── Categories grid ── */
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
  transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37,99,235,0.10);
}
.wz-cb.on {
  border-color: #2563EB; background: #EFF6FF; color: #2563EB;
  font-weight: 600; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); transform: translateY(-2px);
}
.wz-cb-ico {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #F1F5F9; transition: background 0.18s;
}
.wz-cb:hover .wz-cb-ico, .wz-cb.on .wz-cb-ico { background: #DBEAFE; }

/* ── Urgence ── */
.wz-ul { display: flex; flex-direction: column; gap: 10px; }
.wz-uc {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-radius: 14px; cursor: pointer;
  border: 1.5px solid #E2E8F0; background: #fff;
  transition: all 0.18s; user-select: none;
}
.wz-uc:hover { transform: translateX(3px); box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.wz-ur   { display: none; }
.wz-udot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid currentColor; position: relative; transition: all 0.18s;
}
.wz-udot.on::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 7px; height: 7px; border-radius: 50%; background: currentColor;
}
.wz-ui { flex: 1; }
.wz-un { font-size: 14px; font-weight: 600; }
.wz-ud { font-size: 12px; color: #94A3B8; margin-top: 2px; }

/* ── Contact card ── */
.wz-cc {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; border-radius: 14px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
}
.wz-av {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
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

/* ── Photo upload ── */
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
.wz-pt  { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
.wz-ps  { font-size: 12px; color: #94A3B8; }
.wz-pl  { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.wz-pi  {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  background: #F8FAFC; border: 1px solid #E2E8F0;
  font-size: 13px; color: #475569;
}
.wz-pn  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wz-psz { font-size: 11px; color: #94A3B8; flex-shrink: 0; }

/* ── Récap ── */
.wz-recap { display: flex; flex-direction: column; gap: 16px; }
.wz-recap-block { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; }
.wz-recap-head {
  padding: 12px 18px; background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 11px; font-weight: 700; color: #64748B;
  text-transform: uppercase; letter-spacing: 0.07em;
  display: flex; justify-content: space-between; align-items: center;
}
.wz-recap-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.wz-recap-row  { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.wz-recap-lbl  { font-size: 13px; color: #94A3B8; font-weight: 500; flex-shrink: 0; }
.wz-recap-val  { font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; }
.wz-recap-div  { height: 1px; background: #F1F5F9; }
.wz-recap-edit {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #2563EB; font-weight: 500;
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 4px 8px;
  border-radius: 6px; transition: background 0.15s; flex-shrink: 0;
}
.wz-recap-edit:hover { background: #EFF6FF; }

/* ── Status pill (page succès) ── */
.wz-status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.03em;
  background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;
}
.wz-status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #2563EB;
}

/* ── Navigation ── */
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
  border: none; background: #2563EB; color: #fff;
  font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.18s;
  box-shadow: 0 2px 12px rgba(37,99,235,0.30);
}
.wz-nav-btn-next:hover { background: #1D4ED8; box-shadow: 0 4px 20px rgba(37,99,235,0.40); transform: translateY(-1px); }
.wz-nav-btn-submit {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 28px; border-radius: 10px;
  border: none; background: #059669; color: #fff;
  font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.18s;
  box-shadow: 0 2px 12px rgba(5,150,105,0.30);
}
.wz-nav-btn-submit:hover { background: #047857; box-shadow: 0 4px 20px rgba(5,150,105,0.40); transform: translateY(-1px); }

/* ── Success screen ── */
.wz-success {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 24px; text-align: center;
  animation: wzSlide 0.5s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzSlide {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.wz-success-ring {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #059669, #047857);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px; box-shadow: 0 8px 32px rgba(5,150,105,0.30);
}
.wz-success-title {
  font-family: 'DM Serif Display', serif;
  font-size: 28px; font-weight: 400; color: #0F172A; margin-bottom: 12px;
}
.wz-success-sub { font-size: 15px; color: #64748B; margin-bottom: 28px; line-height: 1.6; }

/* ── Step animations ── */
.wz-step-anim {
  animation: wzStep 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzStep {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
.wz-step-anim-back {
  animation: wzStepBack 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes wzStepBack {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
`;
