// src/pages/manager/TeamPerformance.jsx
import { useMemo, useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { KpiCard } from "../../components/common/DashboardShared";
import { tickets, users } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import styles from "./TeamPerformance.module.css";

// ── Icônes ─────────────────────────────────────────────────────────────────────
const Icon = {
  search:   (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  star:     (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  starHalf: (<svg width="12" height="12" viewBox="0 0 24 24"><defs><linearGradient id="hg"><stop offset="50%" stopColor="#F59E0B"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#hg)" stroke="#E5E7EB" strokeWidth="1"/></svg>),
  starEmpty:(<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  medal:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>),
  trend:    (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  clock:    (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  user:     (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  check:    (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  ticket:   (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>),
  alertSmall:(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  target:   (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>),
  zap:      (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  activity: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
};

// ── Constantes ──────────────────────────────────────────────────────────────────
const PIE_COLORS    = ["#2563EB","#F59E0B","#22C55E","#8B5CF6","#EF4444","#06B6D4","#EC4899","#10B981"];
const MEDALS        = ["🥇","🥈","🥉"];
const PODIUM_BG     = [
  "linear-gradient(135deg,#FEF3C7,#FDE68A)",
  "linear-gradient(135deg,#F3F4F6,#E5E7EB)",
  "linear-gradient(135deg,#FFF7ED,#FED7AA)",
];
const PODIUM_BORDER = ["#FDE68A","#D1D5DB","#FDBA74"];

const SPECIALITES = ["Électricité","Plomberie","CVC / Climatisation","Informatique","Sécurité","Ascenseurs","Général"];

const STATUT_TECH = {
  actif:  { label:"Actif",    bg:"#F0FDF4", color:"#16A34A", dot:"#22C55E" },
  occupe: { label:"Occupé",   bg:"#FFFBEB", color:"#D97706", dot:"#F59E0B" },
  conge:  { label:"En congé", bg:"#F3F4F6", color:"#6B7280", dot:"#9CA3AF" },
};

const CONSEILS = [
  { icon:"⚡", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A",
    title:"Conseil du jour",
    text:"Assignez en priorité les tickets critiques aux techniciens avec le meilleur taux de résolution pour réduire les délais d'intervention." },
  { icon:"🎯", color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE",
    title:"Objectif recommandé",
    text:"Visez un taux de résolution global supérieur à 80% pour maintenir la satisfaction des équipes et des clients." },
  { icon:"📊", color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE",
    title:"Point d'analyse",
    text:"Les techniciens avec plus de 5 tickets en cours montrent souvent une baisse de performance — envisagez un rééquilibrage de charge." },
  { icon:"💡", color:"#059669", bg:"#F0FDF4", border:"#BBF7D0",
    title:"Bonne pratique",
    text:"Un suivi individuel hebdomadaire améliore le score moyen de l'équipe de 12% selon les données de performance historiques." },
  { icon:"🔍", color:"#DC2626", bg:"#FEF2F2", border:"#FECACA",
    title:"Attention requise",
    text:"Vérifiez les tickets en retard depuis plus de 48h — ils impactent directement la satisfaction et le score global de l'équipe." },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────
const heuresDepuis = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
const initials = (nom) => (nom || "??").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);

const delaiMoyenResolution = (techTickets) => {
  const resolus = techTickets.filter(t => ["resolved","closed"].includes(t.statut));
  if (!resolus.length) return null;
  return Math.round(resolus.reduce((a,t) => a + heuresDepuis(t.dateCreation), 0) / resolus.length);
};

const formatDelai = (h) => {
  if (h === null) return "—";
  if (h < 24) return `${h}h`;
  const j = Math.floor(h/24), r = h%24;
  return r > 0 ? `${j}j ${r}h` : `${j}j`;
};

const noteSimulee = (techTickets, seed) => {
  if (!techTickets.length) return null;
  const rate = techTickets.filter(t => ["resolved","closed"].includes(t.statut)).length / techTickets.length;
  const base = 3.5 + rate * 1.5;
  const jitter = ((seed * 7919) % 10) / 20 - 0.25;
  return parseFloat(Math.min(5, Math.max(1, base + jitter)).toFixed(1));
};

const calcScore = (techTickets) => {
  if (!techTickets.length) return 0;
  const resolus = techTickets.filter(t => ["resolved","closed"].includes(t.statut)).length;
  const late    = techTickets.filter(t => t.priorite === "critical" && !["resolved","closed"].includes(t.statut) && heuresDepuis(t.dateCreation) > 24).length;
  return Math.max(0, Math.round((resolus / techTickets.length) * 100 - late * 10));
};

const sortByRate = (a, b) => {
  if (b.tauxResolution !== a.tauxResolution) return b.tauxResolution - a.tauxResolution;
  if (b.score !== a.score) return b.score - a.score;
  return b.resolusTotal - a.resolusTotal;
};

const scoreColor = (s) => s >= 75 ? "#22C55E" : s >= 45 ? "#F59E0B" : "#EF4444";
const scoreBg    = (s) => s >= 75 ? "#F0FDF4" : s >= 45 ? "#FFFBEB" : "#FEF2F2";
const scoreLabel = (s) => s >= 75 ? "Excellent" : s >= 45 ? "Moyen" : "Faible";

// ── StarRating ──────────────────────────────────────────────────────────────────
function StarRating({ note }) {
  if (note === null) return <Typography sx={{ fontSize:"11px", color:"#9CA3AF" }}>—</Typography>;
  const full = Math.floor(note), half = note - full >= 0.5 ? 1 : 0, empty = 5 - full - half;
  return (
    <Box sx={{ display:"flex", alignItems:"center", gap:"1px" }}>
      {Array(full).fill(0).map((_,i)  => <Box key={`f${i}`} sx={{ color:"#F59E0B", display:"flex" }}>{Icon.star}</Box>)}
      {half === 1 && <Box sx={{ display:"flex" }}>{Icon.starHalf}</Box>}
      {Array(empty).fill(0).map((_,i) => <Box key={`e${i}`} sx={{ display:"flex" }}>{Icon.starEmpty}</Box>)}
      <Typography sx={{ fontSize:"11px", fontWeight:800, color:"#374151", ml:"4px" }}>{note}</Typography>
    </Box>
  );
}

// ── Palette couleurs vibrantes pour PieChart ───────────────────────────────────
const CHART_COLORS = [
  { base:"#6366F1", light:"#EEF2FF" },
  { base:"#F59E0B", light:"#FFFBEB" },
  { base:"#10B981", light:"#ECFDF5" },
  { base:"#EC4899", light:"#FDF2F8" },
  { base:"#3B82F6", light:"#EFF6FF" },
  { base:"#F97316", light:"#FFF7ED" },
  { base:"#8B5CF6", light:"#F5F3FF" },
  { base:"#14B8A6", light:"#F0FDFA" },
];

// ── PurePieChart — titre, couleurs vibrantes, hover moderne ───────────────────
function PurePieChart({ data, total, title = "Répartition", subtitle }) {
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Fusionne les couleurs vibrantes avec les données
  const enriched = data.map((d, i) => ({
    ...d,
    color:      CHART_COLORS[i % CHART_COLORS.length].base,
    colorLight: CHART_COLORS[i % CHART_COLORS.length].light,
  }));

  const SIZE = 210, CX = 105, CY = 105, R_OUT = 88, R_IN = 56;
  let cumul = 0;
  const slices = enriched.map((d) => {
    const pct        = total > 0 ? d.value / total : 0;
    const startAngle = cumul * 2 * Math.PI - Math.PI / 2;
    const endAngle   = (cumul + pct) * 2 * Math.PI - Math.PI / 2;
    cumul += pct;
    return { ...d, pct: Math.round(pct * 100), startAngle, endAngle };
  });

  const polar   = (angle, r) => ({ x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) });
  const arcPath = (s, expand = 0) => {
    const ro = R_OUT + expand, ri = R_IN - (expand > 0 ? 2 : 0);
    const large = s.endAngle - s.startAngle > Math.PI ? 1 : 0;
    const p1 = polar(s.startAngle, ro), p2 = polar(s.endAngle, ro);
    const p3 = polar(s.endAngle,   ri), p4 = polar(s.startAngle, ri);
    return `M${p1.x} ${p1.y} A${ro} ${ro} 0 ${large} 1 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${ri} ${ri} 0 ${large} 0 ${p4.x} ${p4.y}Z`;
  };

  const hovSlice = hovered !== null ? slices[hovered] : null;

  return (
    <Box>
      {/* Titre section */}
      <Box sx={{ mb:"16px" }}>
        <Typography sx={{ fontSize:"15px", fontWeight:800, color:"#111827", letterSpacing:"-0.02em", lineHeight:1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize:"12px", color:"#9CA3AF", mt:"2px" }}>{subtitle}</Typography>
        )}
      </Box>

      <Box sx={{ display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap" }}>

        {/* ── Donut SVG ── */}
        <Box sx={{ flexShrink:0, position:"relative" }}>
          {/* Glow derrière le donut */}
          <Box sx={{
            position:"absolute", inset:"-12px", borderRadius:"50%", pointerEvents:"none",
            background: hovSlice
              ? `radial-gradient(circle, ${hovSlice.color}22 0%, transparent 70%)`
              : "radial-gradient(circle, #6366F122 0%, transparent 70%)",
            transition:"background 0.4s ease",
          }}/>

          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow:"visible" }}>
            <defs>
              <filter id="slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000022"/>
              </filter>
            </defs>

            {total === 0 && (
              <circle cx={CX} cy={CY} r={(R_OUT+R_IN)/2} fill="none" stroke="#F3F4F6" strokeWidth={R_OUT-R_IN}/>
            )}

            {slices.map((s, i) => (
              <path
                key={i}
                d={arcPath(s, hovered === i ? 7 : 0)}
                fill={s.color}
                stroke="#fff"
                strokeWidth={hovered === i ? "2.5" : "2"}
                filter={hovered === i ? "url(#slice-shadow)" : undefined}
                style={{
                  opacity: animated ? (hovered !== null && hovered !== i ? 0.5 : 1) : 0,
                  transform: animated ? "scale(1)" : "scale(0.78)",
                  transformOrigin: `${CX}px ${CY}px`,
                  transition: [
                    `opacity 0.5s ease ${i * 0.08}s`,
                    `transform 0.5s cubic-bezier(.34,1.56,.64,1) ${i * 0.08}s`,
                    "d 0.25s cubic-bezier(.34,1.2,.64,1)",
                    "filter 0.2s ease",
                  ].join(", "),
                  cursor:"pointer",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {/* Texte centre dynamique */}
            <text
              x={CX} y={CY - 10}
              textAnchor="middle"
              fontSize={hovSlice ? "18" : "24"}
              fontWeight="900"
              fill={hovSlice ? hovSlice.color : "#111827"}
              style={{ transition:"all 0.25s ease", fontVariantNumeric:"tabular-nums" }}
            >
              {hovSlice ? hovSlice.value : total}
            </text>
            <text
              x={CX} y={CY + 8}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={hovSlice ? hovSlice.color : "#9CA3AF"}
              style={{ textTransform:"uppercase", letterSpacing:"0.07em", transition:"all 0.25s ease" }}
            >
              {hovSlice ? hovSlice.name.split(" ")[0] : "tickets"}
            </text>
            {hovSlice && (
              <text
                x={CX} y={CY + 24}
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fill={hovSlice.color}
              >
                {hovSlice.pct}%
              </text>
            )}
          </svg>
        </Box>

        {/* ── Légende interactive ── */}
        <Box sx={{ display:"flex", flexDirection:"column", gap:"5px", flex:1, minWidth:"130px" }}>
          {slices.map((s, i) => (
            <Box
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              sx={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"7px 10px",
                borderRadius:"10px",
                border:"1.5px solid",
                borderColor: hovered === i ? s.color + "55" : "transparent",
                backgroundColor: hovered === i ? s.colorLight : "transparent",
                cursor:"pointer",
                opacity:   animated ? (hovered !== null && hovered !== i ? 0.5 : 1) : 0,
                transform: animated ? "translateX(0)" : "translateX(16px)",
                transition: [
                  `opacity 0.4s ease ${0.3 + i * 0.07}s`,
                  `transform 0.4s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.07}s`,
                  "background-color 0.2s ease",
                  "border-color 0.2s ease",
                ].join(", "),
              }}
            >
              <Box sx={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <Box sx={{
                  width:10, height:10, borderRadius:"3px",
                  backgroundColor: s.color, flexShrink:0,
                  boxShadow: hovered === i ? `0 0 0 3px ${s.color}33` : "none",
                  transition:"box-shadow 0.2s ease",
                }}/>
                <Typography sx={{
                  fontSize:"12px",
                  fontWeight: hovered === i ? 700 : 500,
                  color: hovered === i ? "#111827" : "#374151",
                  maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  transition:"font-weight 0.15s ease, color 0.15s ease",
                }}>
                  {s.name}
                </Typography>
              </Box>
              <Box sx={{ display:"flex", alignItems:"center", gap:"6px", ml:"8px" }}>
                <Box sx={{
                  backgroundColor: hovered === i ? s.color : "#F3F4F6",
                  color:           hovered === i ? "#fff"   : "#6B7280",
                  borderRadius:"6px", padding:"1px 7px",
                  fontSize:"11px", fontWeight:800,
                  transition:"background-color 0.2s ease, color 0.2s ease",
                }}>
                  {s.value}
                </Box>
                <Typography sx={{
                  fontSize:"10px", fontWeight:700, minWidth:"28px",
                  color: hovered === i ? s.color : "#9CA3AF",
                  transition:"color 0.2s ease",
                }}>
                  {s.pct}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ── TeamBarChart ─────────────────────────────────────────────────────────────────
const getLast3Months = () => {
  const now = new Date();
  return [2,1,0].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { label: d.toLocaleDateString("fr-FR",{month:"short"}).replace(".",""), year: d.getFullYear(), month: d.getMonth() };
  });
};

function TeamBarChart({ allTickets }) {
  const months = getLast3Months();
  const counts = months.map(({year,month}) =>
    allTickets.filter(t => { const d = new Date(t.dateCreation); return d.getFullYear()===year && d.getMonth()===month; }).length
  );
  const max = Math.max(...counts, 1);
  return (
    <Box>
      <Box sx={{ display:"flex", alignItems:"flex-end", gap:"10px", height:"64px", mb:"8px" }}>
        {months.map((m,i) => {
          const isCur = i === 2;
          return (
            <Box key={i} sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
              <Typography sx={{ fontSize:"10px", fontWeight:700, color: isCur ? "#2563EB" : "#9CA3AF" }}>{counts[i] || ""}</Typography>
              <Box sx={{ width:"100%", height:`${Math.max((counts[i]/max)*50, 4)}px`, borderRadius:"4px 4px 0 0", background: isCur ? "linear-gradient(180deg,#3B82F6,#2563EB)" : "#E5E7EB", transition:"height 0.4s ease" }}/>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display:"flex", gap:"10px" }}>
        {months.map((m,i) => (
          <Box key={i} sx={{ flex:1, textAlign:"center" }}>
            <Typography sx={{ fontSize:"11px", fontWeight: i===2?700:500, color: i===2?"#2563EB":"#9CA3AF", textTransform:"capitalize" }}>{m.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Bloc Conseil du jour ────────────────────────────────────────────────────────
function ConseilDuJour({ techStats, totalTickets, critiquesAlert }) {
  const conseil = CONSEILS[new Date().getDay() % CONSEILS.length];
  const avgTaux = techStats.length
    ? Math.round(techStats.reduce((a,t) => a + t.tauxResolution, 0) / techStats.length)
    : 0;

  return (
    <Paper elevation={0} sx={{
      borderRadius:"14px",
      border:`1.5px solid ${conseil.border}`,
      backgroundColor: conseil.bg,
      boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
      p:"18px 22px", mb:"20px",
    }}>
      <Box sx={{ display:"flex", gap:"20px", flexWrap:"wrap", alignItems:"center" }}>
        <Box sx={{ flex:"1 1 240px", minWidth:0 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:"8px", mb:"6px" }}>
            <Box sx={{ fontSize:"20px", lineHeight:1 }}>{conseil.icon}</Box>
            <Typography sx={{ fontSize:"10px", fontWeight:800, color:conseil.color, textTransform:"uppercase", letterSpacing:"0.09em" }}>
              {conseil.title}
            </Typography>
          </Box>
          <Typography sx={{ fontSize:"13px", color:"#374151", lineHeight:1.65, fontWeight:500 }}>
            {conseil.text}
          </Typography>
        </Box>
        <Box sx={{ width:"1px", alignSelf:"stretch", backgroundColor:conseil.border, flexShrink:0, display:{ xs:"none", sm:"block" } }}/>
        <Box sx={{ display:"flex", gap:"20px", alignItems:"center", flexShrink:0 }}>
          {[
            { label:"Taux moyen",       value:`${avgTaux}%`,  icon:Icon.target,   color:"#2563EB" },
            { label:"Tickets critiques",value:critiquesAlert, icon:Icon.zap,      color: critiquesAlert > 0 ? "#EF4444" : "#22C55E" },
            { label:"Total tickets",    value:totalTickets,   icon:Icon.activity, color:"#8B5CF6" },
          ].map(s => (
            <Box key={s.label} sx={{ textAlign:"center" }}>
              <Box sx={{ display:"flex", justifyContent:"center", color:s.color, mb:"3px" }}>{s.icon}</Box>
              <Typography sx={{ fontSize:"22px", fontWeight:900, color:s.color, lineHeight:1, letterSpacing:"-0.5px" }}>{s.value}</Typography>
              <Typography sx={{ fontSize:"9px", color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", mt:"2px" }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function TeamPerformance() {
  const { user: authUser } = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const now = new Date();

  const techniciens = useMemo(
    () => users.filter(u => u.role === "technician" || u.role === "technicien"),
    []
  );

  const techStats = useMemo(() =>
    techniciens.map((tech, idx) => {
      const techTickets   = tickets.filter(t => t.technicienId === tech.id);
      const thisMonth     = techTickets.filter(t => {
        const d = new Date(t.dateCreation);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      const resolusMonth  = thisMonth.filter(t => ["resolved","closed"].includes(t.statut)).length;
      const resolusTotal  = techTickets.filter(t => ["resolved","closed"].includes(t.statut)).length;
      const enCours       = techTickets.filter(t => t.statut === "in_progress").length;
      const critiquesLate = techTickets.filter(t =>
        t.priorite === "critical" && !["resolved","closed"].includes(t.statut) && heuresDepuis(t.dateCreation) > 24
      ).length;
      const delaiMoyen    = delaiMoyenResolution(techTickets);
      const note          = noteSimulee(techTickets, idx + 1);
      const score         = calcScore(techTickets);
      const specialite    = SPECIALITES[idx % SPECIALITES.length];
      const statutKey     = enCours >= 3 ? "occupe" : resolusTotal === 0 ? "conge" : "actif";
      const tauxResolution = techTickets.length > 0
        ? Math.round((resolusTotal / techTickets.length) * 100) : 0;
      return { ...tech, techTickets, totalTickets: techTickets.length, resolusTotal, resolusMonth, enCours, critiquesLate, delaiMoyen, note, score, specialite, statutKey, tauxResolution };
    }),
    [techniciens]
  );

  const globalRanking = useMemo(() => [...techStats].sort(sortByRate), [techStats]);
  const top3 = useMemo(() => globalRanking.slice(0, 3), [globalRanking]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...techStats]
      .filter(t => !q || (t.nom||"").toLowerCase().includes(q) || t.specialite.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === "score")   return b.score - a.score;
        if (sortBy === "resolus") return b.resolusMonth - a.resolusMonth;
        if (sortBy === "delai")   return (a.delaiMoyen ?? 9999) - (b.delaiMoyen ?? 9999);
        if (sortBy === "note")    return (b.note ?? 0) - (a.note ?? 0);
        return sortByRate(a, b);
      });
  }, [techStats, search, sortBy]);

  const totalTickets   = tickets.length;
  const totalResolus   = tickets.filter(t => ["resolved","closed"].includes(t.statut)).length;
  const totalEnCours   = tickets.filter(t => t.statut === "in_progress").length;
  const tauxGlobal     = totalTickets > 0 ? Math.round((totalResolus/totalTickets)*100) : 0;
  const critiquesAlert = tickets.filter(t =>
    t.priorite === "critical" && !["resolved","closed"].includes(t.statut) && heuresDepuis(t.dateCreation) > 24
  ).length;

  const pieData = useMemo(() =>
    techStats.filter(t => t.totalTickets > 0).map((t, i) => ({
      name:  t.nom || `Tech ${i+1}`,
      value: t.totalTickets,
      pct:   totalTickets > 0 ? Math.round((t.totalTickets/totalTickets)*100) : 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    })),
    [techStats, totalTickets]
  );

  const maxResolus = Math.max(...techStats.map(t => t.resolusMonth), 1);

  return (
    <Box sx={{ pb:"80px" }}>

      {/* ══ KPI CARDS ════════════════════════════════════════ */}
      <Box sx={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", mb:"20px" }}>
        <KpiCard icon={Icon.user}   label="Techniciens"     count={techniciens.length} color="#2563EB" bgColor="#EFF6FF" description="Dans l'équipe" />
        <KpiCard icon={Icon.ticket} label="Tickets total"   count={totalTickets}       color="#8B5CF6" bgColor="#F5F3FF" description="Tous statuts" />
        <KpiCard icon={Icon.check}  label="Taux résolution" count={`${tauxGlobal}%`}  color="#22C55E" bgColor="#F0FDF4" description={`${totalResolus} résolus`} />
        <KpiCard icon={Icon.clock}  label="En cours"        count={totalEnCours}       color="#F59E0B" bgColor="#FFFBEB" description="En traitement" />
      </Box>

      {/* ══ CONSEIL DU JOUR ══════════════════════════════════ */}
      <ConseilDuJour techStats={globalRanking} totalTickets={totalTickets} critiquesAlert={critiquesAlert} />

      {/* ══ PODIUM TOP 3 ═════════════════════════════════════ */}
      <Paper elevation={0} sx={{ borderRadius:"14px", border:"1px solid #E5E7EB", backgroundColor:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", p:"20px 24px", mb:"20px" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:"8px", mb:"18px" }}>
          <Typography sx={{ fontSize:"10px", fontWeight:800, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.09em", whiteSpace:"nowrap" }}>
            🏆 Podium du mois — Top 3
          </Typography>
          <Box sx={{ flex:1, height:"1px", backgroundColor:"#F3F4F6" }}/>
          <Box sx={{ display:"flex", alignItems:"center", gap:"6px", backgroundColor:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:"999px", padding:"4px 10px" }}>
            <Box sx={{ color:"#FCD34D", display:"flex" }}>{Icon.medal}</Box>
            <Typography sx={{ fontSize:"11px", fontWeight:700, color:"#2563EB" }}>
              {techniciens.length} technicien{techniciens.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px" }}>
          {top3.map((tech, i) => (
            <Box key={tech.id} sx={{
              background: PODIUM_BG[i],
              border:`1.5px solid ${PODIUM_BORDER[i]}`,
              borderRadius:"14px", padding:"18px 16px",
              position:"relative", overflow:"hidden",
              transition:"transform 0.18s, box-shadow 0.18s",
              "&:hover": { transform:"translateY(-3px)", boxShadow:"0 10px 28px rgba(0,0,0,0.10)" },
            }}>
              <Box sx={{ position:"absolute", top:"14px", right:"14px", fontSize:"24px", lineHeight:1 }}>
                {MEDALS[i]}
              </Box>
              <Box sx={{ display:"flex", alignItems:"center", gap:"10px", mb:"10px" }}>
                <Box sx={{ width:42, height:42, borderRadius:"12px", background:"rgba(255,255,255,0.75)", border:"2px solid rgba(255,255,255,0.95)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:900, color:"#374151", flexShrink:0, letterSpacing:"-0.5px" }}>
                  {tech.avatar || initials(tech.nom)}
                </Box>
                <Box sx={{ minWidth:0, pr:"32px" }}>
                  <Typography sx={{ fontSize:"14px", fontWeight:900, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"-0.3px" }}>
                    {tech.nom || "Technicien"}
                  </Typography>
                  <Typography sx={{ fontSize:"10px", color:"#6B7280", fontWeight:500 }}>{tech.specialite}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb:"12px" }}>
                <StarRating note={tech.note} />
              </Box>
              <Box sx={{ display:"flex", gap:"6px" }}>
                {[
                  { val:`${tech.tauxResolution}%`, label:"Taux" },
                  { val: tech.resolusTotal,         label:"Résolus" },
                  { val: tech.score,                label:"Score" },
                ].map(s => (
                  <Box key={s.label} sx={{ flex:1, backgroundColor:"rgba(255,255,255,0.65)", borderRadius:"9px", padding:"7px 4px", textAlign:"center" }}>
                    <Typography sx={{ fontSize:"17px", fontWeight:900, color:"#111827", lineHeight:1, letterSpacing:"-0.5px" }}>{s.val}</Typography>
                    <Typography sx={{ fontSize:"9px", color:"#6B7280", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", mt:"2px" }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ══ GRAPHIQUES ═══════════════════════════════════════ */}
      <Box sx={{ display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:"14px", mb:"20px" }}>

        {/* PieChart avec titre, couleurs vibrantes, hover moderne */}
        <Paper elevation={0} sx={{fontWeight: 500, fontSize: "15px", color: "#111827" , borderRadius:"14px", border:"1px solid #E5E7EB", backgroundColor:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", p:"20px 24px" }}>
          <PurePieChart 
            data={pieData}
            total={totalTickets}
            title="Répartition des tickets"
            subtitle={`${totalTickets} tickets assignés à l'équipe`}
          />
        </Paper>

        <Box sx={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <Paper elevation={0} sx={{ borderRadius:"14px", border:"1px solid #E5E7EB", backgroundColor:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", p:"18px 20px", flex:1 }}>
            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:"14px" }}>
              <Box>
                <Typography sx={{ fontSize:"10px", fontWeight:800, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.08em" }}>Score performance</Typography>
                <Typography sx={{ fontSize:"11px", color:"#6B7280" }}>Classement équipe</Typography>
              </Box>
              <Box sx={{ color:"#22C55E", display:"flex" }}>{Icon.trend}</Box>
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", gap:"9px" }}>
              {[...techStats].sort((a,b) => b.score - a.score).slice(0,5).map((tech,i) => (
                <Box key={tech.id}>
                  <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:"3px" }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <Typography sx={{ fontSize:"10px", fontWeight:700, color:"#9CA3AF", width:"14px" }}>#{i+1}</Typography>
                      <Box sx={{ width:20, height:20, borderRadius:"6px", background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)", color:"#2563EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", fontWeight:800 }}>
                        {tech.avatar || initials(tech.nom)}
                      </Box>
                      <Typography sx={{ fontSize:"11px", fontWeight:600, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"90px" }}>
                        {(tech.nom||"Tech").split(" ")[0]}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize:"11px", fontWeight:800, color:scoreColor(tech.score) }}>{tech.score}</Typography>
                  </Box>
                  <Box sx={{ height:"4px", backgroundColor:"#F3F4F6", borderRadius:"999px", overflow:"hidden" }}>
                    <Box sx={{ height:"100%", width:`${tech.score}%`, backgroundColor:scoreColor(tech.score), borderRadius:"999px", transition:"width 0.6s ease" }}/>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius:"14px", border:"1px solid #E5E7EB", backgroundColor:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", p:"18px 20px" }}>
            <Typography sx={{ fontSize:"10px", fontWeight:800, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.08em", mb:"12px" }}>
              Activité mensuelle équipe
            </Typography>
            <TeamBarChart allTickets={tickets}/>
          </Paper>
        </Box>
      </Box>

      {/* ══ TABLEAU ══════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ borderRadius:"14px", border:"1px solid #E5E7EB", backgroundColor:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden" }}>

        <Box sx={{ padding:"16px 24px 14px", borderBottom:"1px solid #F3F4F6" }}>
          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
            <Box>
              <Typography sx={{ fontWeight:700, fontSize:"15px", color:"#111827" }}>Tableau de l'équipe</Typography>
              <Typography sx={{ fontSize:"12px", color:"#9CA3AF", mt:"1px" }}>
                {sorted.length} technicien{sorted.length > 1 ? "s" : ""}
              </Typography>
            </Box>
            <Box sx={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>{Icon.search}</span>
                <input
                  className={styles.searchInput}
                  placeholder="Rechercher…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Box sx={{ display:"flex", gap:"6px" }}>
                {[
                  { key:"score",   label:"Score"   },
                  { key:"resolus", label:"Résolus" },
                  { key:"delai",   label:"Délai"   },
                  { key:"note",    label:"Note"    },
                ].map(s => (
                  <button
                    key={s.key}
                    className={`${styles.pill}${sortBy === s.key ? " " + styles.active : ""}`}
                    onClick={() => setSortBy(s.key)}
                  >{s.label}</button>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ overflowX:"auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Technicien</th>
                <th>Spécialité</th>
                <th>Statut</th>
                <th>Taux</th>
                <th>Résolus (mois)</th>
                <th>Total assignés</th>
                <th>Délai moyen</th>
                <th>Note</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className={styles.empty}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                      <p>Aucun technicien trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : sorted.map((tech, i) => {
                const globalRank = globalRanking.findIndex(t => t.id === tech.id);
                const statutCfg  = STATUT_TECH[tech.statutKey] || STATUT_TECH.actif;
                return (
                  <tr key={tech.id} style={{ animationDelay:`${i * 0.04}s` }}>
                    <td>
                      {globalRank < 3
                        ? <span style={{ fontSize:"18px" }}>{MEDALS[globalRank]}</span>
                        : <Typography sx={{ fontSize:"12px", fontWeight:700, color:"#9CA3AF" }}>#{globalRank + 1}</Typography>
                      }
                    </td>
                    <td>
                      <Box sx={{ display:"flex", alignItems:"center", gap:"9px" }}>
                        <Box sx={{ width:34, height:34, borderRadius:"9px", background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)", color:"#2563EB", border:"1.5px solid #BFDBFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800, flexShrink:0 }}>
                          {tech.avatar || initials(tech.nom)}
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize:"13px", fontWeight:700, color:"#111827" }}>{tech.nom || "—"}</Typography>
                          <Typography sx={{ fontSize:"11px", color:"#9CA3AF" }}>{tech.email || "—"}</Typography>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Typography sx={{ fontSize:"12px", color:"#374151", fontWeight:500, backgroundColor:"#F9FAFB", border:"1px solid #F3F4F6", borderRadius:"6px", padding:"3px 8px", display:"inline-block", whiteSpace:"nowrap" }}>
                        {tech.specialite}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display:"inline-flex", alignItems:"center", gap:"5px", backgroundColor:statutCfg.bg, borderRadius:"999px", padding:"3px 10px" }}>
                        <Box sx={{ width:6, height:6, borderRadius:"50%", backgroundColor:statutCfg.dot, flexShrink:0 }}/>
                        <Typography sx={{ fontSize:"11px", fontWeight:700, color:statutCfg.color }}>{statutCfg.label}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Box sx={{ display:"inline-flex", alignItems:"center", gap:"4px", backgroundColor:scoreBg(tech.tauxResolution), borderRadius:"8px", padding:"4px 10px" }}>
                        <Typography sx={{ fontSize:"14px", fontWeight:900, color:scoreColor(tech.tauxResolution), lineHeight:1, letterSpacing:"-0.3px" }}>
                          {tech.tauxResolution}%
                        </Typography>
                      </Box>
                    </td>
                    <td>
                      <Box sx={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <Typography sx={{ fontSize:"17px", fontWeight:900, color:"#111827", lineHeight:1, minWidth:"18px", letterSpacing:"-0.5px" }}>
                          {tech.resolusMonth}
                        </Typography>
                        <Box sx={{ flex:1, minWidth:"50px" }}>
                          <Box sx={{ height:"4px", backgroundColor:"#F3F4F6", borderRadius:"999px", overflow:"hidden" }}>
                            <Box sx={{ height:"100%", width:`${(tech.resolusMonth/maxResolus)*100}%`, backgroundColor:"#22C55E", borderRadius:"999px", transition:"width 0.6s ease" }}/>
                          </Box>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Typography sx={{ fontSize:"13px", fontWeight:700, color:"#374151" }}>{tech.totalTickets}</Typography>
                    </td>
                    <td>
                      <Box sx={{ display:"flex", alignItems:"center", gap:"4px" }}>
                        <Box sx={{ color:"#9CA3AF", display:"flex" }}>{Icon.clock}</Box>
                        <Typography sx={{ fontSize:"12px", fontWeight:600, color: tech.delaiMoyen !== null && tech.delaiMoyen < 48 ? "#22C55E" : tech.delaiMoyen !== null ? "#F59E0B" : "#9CA3AF" }}>
                          {formatDelai(tech.delaiMoyen)}
                        </Typography>
                      </Box>
                    </td>
                    <td><StarRating note={tech.note}/></td>
                    <td>
                      <Box sx={{ display:"inline-flex", alignItems:"center", gap:"5px", backgroundColor:scoreBg(tech.score), borderRadius:"8px", padding:"4px 10px" }}>
                        <Typography sx={{ fontSize:"14px", fontWeight:900, color:scoreColor(tech.score), lineHeight:1, letterSpacing:"-0.3px" }}>
                          {tech.score}
                        </Typography>
                        <Typography sx={{ fontSize:"9px", fontWeight:700, color:scoreColor(tech.score), textTransform:"uppercase", opacity:0.8 }}>
                          {scoreLabel(tech.score)}
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>

        {critiquesAlert > 0 && (
          <Box sx={{ borderTop:"1px solid #F3F4F6", padding:"10px 24px", display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#FEF2F2" }}>
            <Box sx={{ color:"#EF4444", display:"flex", flexShrink:0 }}>{Icon.alertSmall}</Box>
            <Typography sx={{ fontSize:"12px", fontWeight:600, color:"#EF4444" }}>
              {critiquesAlert} ticket{critiquesAlert > 1 ? "s" : ""} critique{critiquesAlert > 1 ? "s" : ""} en retard (&gt;24h) dans l'équipe — intervention requise
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}