// src/pages/ReportsPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ticketService, userService } from "../services/api";

import Badge  from "../components/common/badge/Badge";
import Button from "../components/common/Button";
import {
  BarChartIcon, TicketIcon, ClockIcon, CheckCircleIcon,
} from "../components/common/Icons";

const BLUE   = "#2563eb";
const BLUE_L = "#eff6ff";
const BORDER = "#e5e7eb";
const MUTED  = "#6b7280";
const TEXT   = "#111827";

const ROLE_TYPES = {
  admin:      ["tickets", "performance", "worklog", "audit"],
  manager:    ["tickets", "performance", "worklog"],
  technician: ["worklog", "tickets"],
};
const TYPE_LABELS = {
  tickets:     "Rapport Tickets",
  performance: "Performance Techniciens",
  worklog:     "Journal de Travail",
  audit:       "Audit Système",
};
const FORMAT_META = {
  pdf:   { emoji:"📄", label:"PDF",   color:"#ef4444", bg:"#fef2f2" },
  excel: { emoji:"📊", label:"EXCEL", color:"#16a34a", bg:"#f0fdf4" },
  csv:   { emoji:"📋", label:"CSV",   color:"#2563eb", bg:"#eff6ff" },
};
const PRIORITY_META = {
  critical: { label:"Critique", color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
  high:     { label:"Haute",    color:"#ea580c", bg:"#fff7ed", border:"#fed7aa" },
  medium:   { label:"Moyenne",  color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
  low:      { label:"Basse",    color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb" },
};

// ✅ Résout l'id qu'il soit string ou objet populé { _id, nom }
const resolveId = (val) => {
  if (!val) return null;
  if (typeof val === "object") return val._id || val.id || null;
  return val;
};

// ✅ getName robuste — id peut être string ou objet populé
const getName = (id, users) => {
  if (!id) return "—";
  if (typeof id === "object" && id.nom) return id.nom;
  const rawId = resolveId(id);
  return users.find(u => (u._id || u.id) === rawId)?.nom || "—";
};

// ✅ getDate robuste — createdAt ou dateCreation
const getDate = (t) => (t.createdAt || t.dateCreation || "").slice(0, 10);

function computeReport(type, userId, userRole, dateFrom, dateTo, tickets, users) {
  let src = userRole === "technician"
    ? tickets.filter(t => resolveId(t.technicienId) === userId)
    : [...tickets];

  if (dateFrom) src = src.filter(t => getDate(t) >= dateFrom);
  if (dateTo)   src = src.filter(t => getDate(t) <= dateTo);

  if (type === "tickets") {
    const byStatus = {}, byPriority = {}, byCategory = {};
    src.forEach(t => {
      byStatus[t.statut]      = (byStatus[t.statut]      || 0) + 1;
      byPriority[t.priorite]  = (byPriority[t.priorite]  || 0) + 1;
      byCategory[t.categorie] = (byCategory[t.categorie] || 0) + 1;
    });
    return {
      type,
      summary: { total: src.length, open: byStatus.open||0, assigned: byStatus.assigned||0, inProgress: byStatus.in_progress||0, resolved: byStatus.resolved||0, closed: byStatus.closed||0 },
      byPriority, byCategory,
      rows: src.map(t => ({ id: t._id||t.id, titre: t.titre, statut: t.statut, priorite: t.priorite, categorie: t.categorie, localisation: t.localisation, technicien: getName(t.technicienId, users), date: getDate(t) })),
    };
  }
  if (type === "performance") {
    const techs = users.filter(u => u.role === "technician" || u.role === "technicien");
    return {
      type,
      rows: techs.map(tech => {
        const tid      = tech._id || tech.id;
        const assigned = src.filter(t => resolveId(t.technicienId) === tid);
        const resolved = assigned.filter(t => t.statut === "resolved" || t.statut === "closed");
        const inProg   = assigned.filter(t => t.statut === "in_progress");
        const rate     = assigned.length > 0 ? Math.round(resolved.length / assigned.length * 100) : 0;
        return { id: tid, nom: tech.nom, competences: tech.competences?.join(", ")||"—", assigned: assigned.length, resolved: resolved.length, inProgress: inProg.length, rate };
      }),
    };
  }
  if (type === "worklog") {
    const filtered = userRole === "technician" ? src : src.filter(t => t.technicienId);
    return {
      type,
      rows: filtered.map(t => ({ id: t._id||t.id, titre: t.titre, technicien: getName(t.technicienId, users), statut: t.statut, categorie: t.categorie, localisation: t.localisation, date: getDate(t), notes: t.notes?.[0]?.texte || t.notes?.[0] || "—" })),
    };
  }
  if (type === "audit") {
    const byRole = {};
    users.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return {
      type,
      summary: { totalUsers: users.length, totalTickets: src.length, criticalOpen: src.filter(t => t.priorite === "critical" && t.statut === "open").length, unassigned: src.filter(t => !t.technicienId).length },
      byRole,
      rows: src.map(t => ({ id: t._id||t.id, titre: t.titre, auteur: getName(t.auteurId, users), technicien: getName(t.technicienId, users), statut: t.statut, priorite: t.priorite, date: getDate(t) })),
    };
  }
  return null;
}

function getExportData(report) {
  if (!report) return { cols: [], rows: [] };
  if (report.type === "tickets")     return { cols: ["ID","Titre","Statut","Priorité","Catégorie","Localisation","Technicien","Date"], rows: report.rows.map(r => [r.id, r.titre, r.statut, r.priorite, r.categorie, r.localisation, r.technicien, r.date]) };
  if (report.type === "performance") return { cols: ["ID","Technicien","Compétences","Assignés","Résolus","En cours","Taux (%)"],     rows: report.rows.map(r => [r.id, r.nom, r.competences, r.assigned, r.resolved, r.inProgress, r.rate]) };
  if (report.type === "worklog")     return { cols: ["ID","Titre","Technicien","Statut","Catégorie","Localisation","Date","Notes"],    rows: report.rows.map(r => [r.id, r.titre, r.technicien, r.statut, r.categorie, r.localisation, r.date, r.notes]) };
  if (report.type === "audit")       return { cols: ["ID","Titre","Auteur","Technicien","Statut","Priorité","Date"],                  rows: report.rows.map(r => [r.id, r.titre, r.auteur, r.technicien, r.statut, r.priorite, r.date]) };
  return { cols: [], rows: [] };
}

function exportCSV(report, filename, description) {
  const { cols, rows } = getExportData(report);
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [];
  if (description) lines.push(`"Description:","${description.replace(/"/g, '""')}"`);
  lines.push(cols.map(esc).join(","));
  rows.forEach(r => lines.push(r.map(esc).join(",")));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename + ".csv"; a.click(); URL.revokeObjectURL(a.href);
}
async function exportExcel(report, filename, title, description) {
  if (!window.XLSX) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
  const { cols, rows } = getExportData(report);
  const data = []; if (description) { data.push(["Description :", description]); data.push([]); } data.push(cols); rows.forEach(r => data.push(r));
  const ws = window.XLSX.utils.aoa_to_sheet(data); const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb, ws, title.slice(0,31)); window.XLSX.writeFile(wb, filename + ".xlsx");
}
async function exportPDF(report, filename, title, description, period) {
  if (!window.jspdf) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  if (!window.jspdf?.jsPDF?.prototype?.autoTable) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation:"landscape" });
  doc.setFontSize(18); doc.setTextColor(37,99,235); doc.text("FixTrack — " + title, 14, 18);
  doc.setFontSize(10); doc.setTextColor(107,114,128); doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}   |   Période : ${period}`, 14, 26);
  let startY = 32; if (description) { doc.setFontSize(10); doc.setTextColor(30,30,30); doc.text("Description : " + description, 14, 34); startY = 42; }
  const { cols, rows } = getExportData(report);
  doc.autoTable({ head:[cols], body:rows, startY, styles:{fontSize:9,cellPadding:3}, headStyles:{fillColor:[37,99,235],textColor:255,fontStyle:"bold"}, alternateRowStyles:{fillColor:[239,246,255]}, margin:{left:14,right:14} });
  doc.save(filename + ".pdf");
}
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }

function KpiCard({ icon, value, label, color }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ width:42, height:42, borderRadius:10, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:24, fontWeight:800, color:TEXT, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:11.5, color:MUTED, marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</div>
      </div>
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".6px", margin:"16px 0 10px", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ flex:1, height:1, background:BORDER }}/>{children}<span style={{ flex:1, height:1, background:BORDER }}/>
    </div>
  );
}
function DataTable({ cols, rows }) {
  const [hov, setHov] = useState(-1);
  return (
    <div style={{ overflowX:"auto", border:`1px solid ${BORDER}`, borderRadius:10, WebkitOverflowScrolling:"touch" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
        <thead><tr style={{ background:"#f9fafb", borderBottom:`1px solid ${BORDER}` }}>{cols.map(c=><th key={c} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:".5px", whiteSpace:"nowrap" }}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${BORDER}`, background:hov===i?"#f9fafb":"transparent", transition:"background .1s" }} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(-1)}>
              {row.map((cell,j)=><td key={j} style={{ padding:"10px 14px", fontSize:12.5, color:TEXT, verticalAlign:"middle" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div style={{ textAlign:"center", padding:"32px 0", color:MUTED, fontSize:13 }}>Aucune donnée pour cette période.</div>}
    </div>
  );
}

function ReportViewer({ report, generatedAt, description }) {
  if (!report) return null;
  const dateStr = generatedAt instanceof Date ? generatedAt.toLocaleString("fr-FR") : generatedAt;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {description && <div style={{ padding:"10px 14px", background:"#f8fafc", border:`1px solid ${BORDER}`, borderRadius:8, fontSize:13, color:TEXT, fontStyle:"italic" }}>📝 {description}</div>}
      <div style={{ fontSize:11, color:MUTED }}>Généré le {dateStr} · {report.rows?.length ?? 0} ligne(s)</div>
      {report.type === "tickets" && <>
        <div className="rp-kpi-grid">
          <KpiCard icon={<TicketIcon width="20" height="20" stroke={BLUE}/>}         value={report.summary.total}                                                     label="Total"              color={BLUE}   />
          <KpiCard icon={<CheckCircleIcon width="20" height="20" stroke="#16a34a"/>} value={report.summary.resolved + report.summary.closed}                          label="Résolus / Clôturés" color="#16a34a"/>
          <KpiCard icon={<ClockIcon width="20" height="20" stroke="#d97706"/>}       value={report.summary.open + report.summary.assigned + report.summary.inProgress} label="En attente"         color="#d97706"/>
        </div>
        <SectionTitle>Par priorité</SectionTitle>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{Object.entries(report.byPriority).map(([p,n])=>{ const m=PRIORITY_META[p]||{}; return <div key={p} style={{ padding:"10px 16px", borderRadius:10, background:m.bg||"#f3f4f6", border:`1px solid ${m.border||BORDER}`, display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:20, fontWeight:900, color:m.color }}>{n}</span><span style={{ fontSize:12, color:m.color, fontWeight:600 }}>{m.label||p}</span></div>; })}</div>
        <SectionTitle>Détail des tickets</SectionTitle>
        <DataTable cols={["ID","Titre","Statut","Priorité","Catégorie","Technicien","Date"]}
          rows={report.rows.map(r=>[
            <span style={{ fontFamily:"monospace", fontSize:11.5 }}>{String(r.id).slice(-6).toUpperCase()}</span>,
            <div><div style={{ fontWeight:600 }}>{r.titre}</div><div style={{ fontSize:11, color:MUTED }}>{r.localisation}</div></div>,
            <Badge status={r.statut}/>,<Badge status={r.priorite}/>,r.categorie,r.technicien,r.date
          ])}/>
      </>}
      {report.type === "performance" && (
        <DataTable cols={["Technicien","Compétences","Assignés","Résolus","En cours","Taux résolution"]}
          rows={report.rows.map(r=>[
            <span style={{ fontWeight:700 }}>{r.nom}</span>,
            <span style={{ fontSize:11.5, color:MUTED }}>{r.competences}</span>,
            <span style={{ fontWeight:700, color:BLUE }}>{r.assigned}</span>,
            <span style={{ fontWeight:700, color:"#16a34a" }}>{r.resolved}</span>,
            <span style={{ fontWeight:700, color:"#d97706" }}>{r.inProgress}</span>,
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ flex:1, height:8, background:"#e5e7eb", borderRadius:4, overflow:"hidden", minWidth:60 }}><div style={{ width:`${r.rate}%`, height:"100%", borderRadius:4, background:r.rate>=70?"#16a34a":r.rate>=40?"#d97706":"#ef4444" }}/></div>
              <span style={{ fontSize:12.5, fontWeight:800, color:r.rate>=70?"#16a34a":r.rate>=40?"#d97706":"#ef4444", minWidth:34 }}>{r.rate}%</span>
            </div>
          ])}/>
      )}
      {report.type === "worklog" && (
        <DataTable cols={["ID","Titre","Technicien","Statut","Catégorie","Localisation","Date","Notes"]}
          rows={report.rows.map(r=>[
            <span style={{ fontFamily:"monospace", fontSize:11.5 }}>{String(r.id).slice(-6).toUpperCase()}</span>,
            <span style={{ fontWeight:600 }}>{r.titre}</span>,
            r.technicien,<Badge status={r.statut}/>,r.categorie,
            <span style={{ fontSize:11.5, color:MUTED }}>{r.localisation}</span>,
            r.date,<span style={{ fontSize:11.5, color:MUTED, fontStyle:"italic" }}>{r.notes}</span>
          ])}/>
      )}
      {report.type === "audit" && <>
        <div className="rp-audit-grid">
          <KpiCard icon="👥" value={report.summary.totalUsers}   label="Utilisateurs"      color={BLUE}   />
          <KpiCard icon="🎫" value={report.summary.totalTickets} label="Tickets total"      color="#7c3aed"/>
          <KpiCard icon="🚨" value={report.summary.criticalOpen} label="Critiques ouverts"  color="#dc2626"/>
          <KpiCard icon="⚠️" value={report.summary.unassigned}   label="Non assignés"       color="#d97706"/>
        </div>
        <SectionTitle>Utilisateurs par rôle</SectionTitle>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{Object.entries(report.byRole).map(([role,n])=><div key={role} style={{ padding:"8px 16px", borderRadius:10, background:"#f3f4f6", border:`1px solid ${BORDER}`, fontSize:12.5, fontWeight:600, color:TEXT }}>{role} <span style={{ color:BLUE }}>({n})</span></div>)}</div>
        <SectionTitle>Tous les tickets</SectionTitle>
        <DataTable cols={["ID","Titre","Auteur","Technicien","Statut","Priorité","Date"]}
          rows={report.rows.map(r=>[
            <span style={{ fontFamily:"monospace", fontSize:11.5 }}>{String(r.id).slice(-6).toUpperCase()}</span>,
            <span style={{ fontWeight:600 }}>{r.titre}</span>,
            r.auteur,r.technicien,<Badge status={r.statut}/>,<Badge status={r.priorite}/>,r.date
          ])}/>
      </>}
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useAuth();
  const role   = user?.role || "technician";
  const userId = user?._id || user?.id || "";
  const allowedTypes = ROLE_TYPES[role] || ["tickets"];

  const [tickets,     setTickets]     = useState([]);
  const [users,       setUsers]       = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ✅ getAll() retourne déjà le tableau directement (pas besoin de { data })
  useEffect(() => {
    Promise.all([ticketService.getAll(), userService.getAll()])
      .then(([t, u]) => {
        setTickets((t || []).map(x => ({ ...x, id: x._id || x.id })));
        setUsers((u || []).map(x => ({ ...x, id: x._id || x.id })));
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  const allDates = useMemo(
    () => tickets.map(t => getDate(t)).filter(Boolean).sort(),
    [tickets]
  );
  const computedDateMin = allDates[0]                   || "2025-01-01";
  const computedDateMax = allDates[allDates.length - 1] || new Date().toISOString().slice(0,10);

  const [selectedType,      setSelectedType]      = useState(allowedTypes[0]);
  const [selectedFmt,       setSelectedFmt]       = useState("pdf");
  const [dateFrom,          setDateFrom]          = useState("2025-01-01");
  const [dateTo,            setDateTo]            = useState(new Date().toISOString().slice(0,10));
  const [description,       setDescription]       = useState("");
  const [generating,        setGenerating]        = useState(false);
  const [downloading,       setDownloading]       = useState(false);
  const [activeReport,      setActiveReport]      = useState(null);
  const [activeGenAt,       setActiveGenAt]       = useState(null);
  const [activeDesc,        setActiveDesc]        = useState("");
  const [history,           setHistory]           = useState([]);
  const [showHistory,       setShowHistory]       = useState(false);
  const [toast,             setToast]             = useState(null);
  const [datesInitialized,  setDatesInitialized]  = useState(false);

  useEffect(() => {
    if (!datesInitialized && allDates.length > 0) {
      setDatesInitialized(true);
      setDateFrom(allDates[0]);
      setDateTo(allDates[allDates.length - 1]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDates.length, datesInitialized]);

  const showToast = (msg, isError = false) => { setToast({ msg, isError }); setTimeout(() => setToast(null), 3200); };
  const quickStats = useMemo(() => ({ generated: history.length, ready: history.filter(h=>h.report).length, pending: generating?1:0 }), [history, generating]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 700));
    const now    = new Date();
    const report = computeReport(selectedType, userId, role, dateFrom, dateTo, tickets, users);
    const entry  = { id:`R${history.length+1}`, type:selectedType, fmt:selectedFmt, generatedAt:now, report, dateFrom, dateTo, description };
    setHistory(prev => [entry, ...prev]);
    setActiveReport(report); setActiveGenAt(now); setActiveDesc(description);
    setGenerating(false);
    showToast(`✅ Rapport généré — ${report?.rows?.length ?? 0} ligne(s)`);
  };

  const handleDownload = async () => {
    if (!activeReport) return;
    setDownloading(true);
    const filename = `FixTrack_${TYPE_LABELS[activeReport.type].replace(/ /g,"_")}_${new Date().toISOString().slice(0,10)}`;
    const title    = TYPE_LABELS[activeReport.type];
    const period   = `${dateFrom} → ${dateTo}`;
    try {
      if (selectedFmt === "csv")   exportCSV(activeReport, filename, activeDesc);
      if (selectedFmt === "excel") await exportExcel(activeReport, filename, title, activeDesc);
      if (selectedFmt === "pdf")   await exportPDF(activeReport, filename, title, activeDesc, period);
      showToast(`⬇️ Téléchargement ${selectedFmt.toUpperCase()} lancé !`);
    } catch(e) { console.error(e); showToast("❌ Erreur lors de l'export", true); }
    setDownloading(false);
  };

  const spinner = (size=16, border=2) => (
    <div style={{ width:size, height:size, border:`${border}px solid rgba(255,255,255,.3)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite", flexShrink:0 }}/>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing:border-box; }
        input[type=date], select, textarea { font-family:'Inter',sans-serif; }
        textarea:focus, input:focus, select:focus { outline:none; border-color:${BLUE}!important; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
        .rp-page { font-family:'Inter',sans-serif; padding:32px 36px; max-width:1140px; margin:0 auto; }
        .rp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:16px; }
        .rp-kpi-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:28px; }
        .rp-audit-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .rp-config-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; align-items:end; }
        .rp-result-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
        .rp-result-actions { display:flex; gap:10px; flex-shrink:0; flex-wrap:wrap; }
        .rp-fmt-row    { display:flex; gap:8px; }
        .rp-period-row { display:flex; gap:8px; }
        .rp-gen-wrap { margin-top:20px; display:flex; justify-content:flex-end; }
        .rp-gen-btn  { height:46px; padding:0 32px; border:none; border-radius:10px; color:#fff; font-family:'Inter',sans-serif; font-size:14px; font-weight:700; transition:all .18s; display:flex; align-items:center; gap:9px; cursor:pointer; white-space:nowrap; }
        .rp-drawer { position:fixed; top:0; right:0; bottom:0; width:380px; background:#fff; border-left:1px solid ${BORDER}; box-shadow:-8px 0 32px rgba(0,0,0,0.1); z-index:200; display:flex; flex-direction:column; animation:slideIn .25s ease; }
      `}</style>

      {toast && <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, background:toast.isError?"#dc2626":"#1e293b", color:"#fff", borderRadius:12, padding:"12px 22px", fontSize:13.5, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.22)", animation:"fadeUp .3s ease" }}>{toast.msg}</div>}

      <div className="rp-page">
        <div className="rp-header">
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:"30px", fontWeight:700, color:"#0F172A", letterSpacing:"-0.02em", lineHeight:1.2, margin:"0 0 6px" }}>Rapports Système</h1>
            <p style={{ fontSize:13, color:MUTED, margin:"6px 0 0" }}>Générez et consultez les rapports de performance et d'exploitation.</p>
          </div>
          <Button label={<span style={{ display:"flex", alignItems:"center", gap:2, fontSize:12 }}>🕐 Historique{history.length > 0 && <span style={{ background:BLUE, color:"#fff", borderRadius:20, fontSize:8, padding:"1px 8px", fontWeight:700 }}>{history.length}</span>}</span>} onClick={()=>setShowHistory(v=>!v)} variant="secondary"/>
        </div>

        <div className="rp-kpi-grid">
          <KpiCard icon={<BarChartIcon stroke={BLUE} width="20" height="20"/>}       value={quickStats.generated} label="Rapports générés"    color={BLUE}   />
          <KpiCard icon={<CheckCircleIcon stroke="#16a34a" width="20" height="20"/>} value={quickStats.ready}     label="Prêts au télécharg." color="#16a34a"/>
          <KpiCard icon={<ClockIcon stroke="#d97706" width="20" height="20"/>}       value={quickStats.pending}   label="En cours de génér."  color="#d97706"/>
        </div>

        <div style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:14, padding:"24px 28px", marginBottom:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:22 }}>
            <span style={{ fontSize:14, color:MUTED }}>▽</span>
            <span style={{ fontSize:15, fontWeight:700, color:TEXT }}>Configuration du Rapport</span>
            {dataLoading && <span style={{ fontSize:11, color:MUTED, marginLeft:"auto" }}>Chargement des données…</span>}
            {!dataLoading && <span style={{ fontSize:11, color:"#16a34a", marginLeft:"auto" }}>✓ {tickets.length} tickets chargés ({computedDateMin} → {computedDateMax})</span>}
          </div>
          <div className="rp-config-grid">
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, marginBottom:8, textTransform:"uppercase", letterSpacing:".5px" }}>Type de rapport</label>
              <select value={selectedType} onChange={e=>setSelectedType(e.target.value)} style={{ width:"100%", height:44, border:`1px solid ${BORDER}`, borderRadius:9, padding:"0 12px", fontSize:13.5, fontWeight:500, color:TEXT, background:"#fff", cursor:"pointer" }}>
                {allowedTypes.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, marginBottom:8, textTransform:"uppercase", letterSpacing:".5px" }}>Période</label>
              <div className="rp-period-row">
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{ flex:1, height:44, border:`1px solid ${BORDER}`, borderRadius:9, padding:"0 10px", fontSize:13, color:TEXT }}/>
                <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{ flex:1, height:44, border:`1px solid ${BORDER}`, borderRadius:9, padding:"0 10px", fontSize:13, color:TEXT }}/>
              </div>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, marginBottom:8, textTransform:"uppercase", letterSpacing:".5px" }}>Format d'export</label>
              <div className="rp-fmt-row">
                {["pdf","excel","csv"].map(f => { const m=FORMAT_META[f]; const active=selectedFmt===f; return <button key={f} onClick={()=>setSelectedFmt(f)} style={{ flex:1, height:44, borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .15s", display:"flex", alignItems:"center", justifyContent:"center", gap:5, border:`1.5px solid ${active?BLUE:BORDER}`, background:active?BLUE_L:"#fff", color:active?BLUE:MUTED }}>{m.emoji} {m.label}</button>; })}
              </div>
            </div>
          </div>
          <div style={{ marginTop:18 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, marginBottom:8, textTransform:"uppercase", letterSpacing:".5px" }}>Description <span style={{ fontWeight:400, textTransform:"none", fontSize:11, color:"#9ca3af" }}>— optionnel</span></label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ajoutez une note ou un contexte pour ce rapport…" rows={2} style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:9, padding:"10px 14px", fontSize:13, color:TEXT, resize:"vertical", lineHeight:1.5, background:"#fafafa" }}/>
          </div>
          <div className="rp-gen-wrap">
            <button className="rp-gen-btn" onClick={handleGenerate} disabled={generating||dataLoading}
              style={{ background:generating?"#93c5fd":`linear-gradient(135deg,${BLUE} 0%,#1d4ed8 100%)`, boxShadow:generating?"none":"0 4px 16px rgba(37,99,235,0.28)", cursor:(generating||dataLoading)?"not-allowed":"pointer" }}>
              {generating ? <>{spinner()} Calcul en cours…</> : <><span>▶</span> Générer le Rapport</>}
            </button>
          </div>
        </div>

        {activeReport && (
          <div style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:14, padding:"24px 28px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", animation:"fadeUp .4s ease" }}>
            <div className="rp-result-header">
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:800, color:TEXT }}>{TYPE_LABELS[activeReport.type]}</div>
                <div style={{ fontSize:11.5, color:MUTED, marginTop:3 }}>Période : {dateFrom} → {dateTo} · {activeReport.rows?.length ?? 0} ligne(s)</div>
              </div>
              <div className="rp-result-actions">
                <button onClick={handleDownload} disabled={downloading}
                  style={{ height:40, padding:"0 20px", background:downloading?"#bbf7d0":"linear-gradient(135deg,#16a34a 0%,#15803d 100%)", border:"none", borderRadius:9, cursor:downloading?"not-allowed":"pointer", color:"#fff", fontFamily:"inherit", fontSize:13, fontWeight:700, boxShadow:downloading?"none":"0 3px 12px rgba(22,163,74,0.25)", transition:"all .18s", display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}>
                  {downloading ? <>{spinner(14,2)} Export…</> : <>{FORMAT_META[selectedFmt]?.emoji} Télécharger {selectedFmt.toUpperCase()}</>}
                </button>
                <Button label="✕ Fermer" onClick={()=>setActiveReport(null)} variant="secondary"/>
              </div>
            </div>
            <ReportViewer report={activeReport} generatedAt={activeGenAt} description={activeDesc} />
          </div>
        )}
      </div>

      {showHistory && (
        <>
          <div onClick={()=>setShowHistory(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.18)", zIndex:199 }}/>
          <div className="rp-drawer">
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:800, color:TEXT }}>🕐 Historique</span>
              <Button label="✕" onClick={()=>setShowHistory(false)} variant="secondary"/>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
              {history.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 0", color:MUTED, fontSize:13 }}><div style={{ fontSize:40, marginBottom:10 }}>📂</div>Aucun rapport généré.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {history.map(entry => {
                    const m = FORMAT_META[entry.fmt]||FORMAT_META.pdf;
                    return (
                      <div key={entry.id} onClick={()=>{ setActiveReport(entry.report); setActiveGenAt(entry.generatedAt); setActiveDesc(entry.description||""); setSelectedFmt(entry.fmt); setShowHistory(false); showToast(`📂 ${TYPE_LABELS[entry.type]} chargé`); }}
                        style={{ padding:"12px 14px", borderRadius:10, border:`1px solid ${BORDER}`, cursor:"pointer", background:"#fff", transition:"all .15s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background=BLUE_L;e.currentTarget.style.borderColor=BLUE;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=BORDER;}}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:34,height:34,borderRadius:8,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{m.emoji}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{TYPE_LABELS[entry.type]}</div>
                            <div style={{ fontSize:11, color:MUTED, marginTop:1 }}>{entry.dateFrom} → {entry.dateTo}</div>
                            {entry.description && <div style={{ fontSize:11, color:MUTED, fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📝 {entry.description}</div>}
                            <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.generatedAt.toLocaleString("fr-FR")}</div>
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, background:"#f3f4f6", color:MUTED, flexShrink:0 }}>{entry.fmt.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {history.length > 0 && (
              <div style={{ padding:"16px 20px", borderTop:`1px solid ${BORDER}` }}>
                <Button label="🗑️ Effacer l'historique" onClick={()=>{ setHistory([]); setActiveReport(null); setShowHistory(false); showToast("🗑️ Historique effacé."); }} variant="danger" fullWidth/>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}