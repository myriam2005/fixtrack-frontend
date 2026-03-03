// src/pages/admin/adminCharts.jsx
// Sparkline · KpiCardSpark · DonutChart · CreatedVsResolvedChart · AreaLineChart · StackedPriorityBar

import { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";

// ── Icônes tendance ───────────────────────────────────────────────────────────
const IcoTrendUp = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const IcoTrendDn = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
//  Sparkline
// ══════════════════════════════════════════════════════════════
export function Sparkline({ data, color, height = 34, width = 76 }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * (height - 4);
    return [x, y];
  });
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = `${lineD} L${width},${height} L0,${height} Z`;
  const gId   = `sk${color.replace("#", "")}`;
  const last  = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.8" fill={color} />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
//  KpiCardSpark
// ══════════════════════════════════════════════════════════════
export function KpiCardSpark({ icon, label, count, color, bgColor, description, sparkData, trend }) {
  const isPos = trend >= 0;
  return (
    <Paper elevation={0} sx={{
      borderRadius: "14px", padding: "18px 20px",
      border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
    }}>
      <Box sx={{ position: "absolute", top: -26, right: -26, width: 86, height: 86, borderRadius: "50%", backgroundColor: bgColor, opacity: 0.8 }} />
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "10px" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color }}>
            {icon}
          </Box>
          {sparkData && <Sparkline data={sparkData} color={color} />}
        </Box>
        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", mb: "3px" }}>{label}</Typography>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: "8px", mb: "3px" }}>
          <Typography sx={{ fontSize: "30px", fontWeight: 900, color: "#111827", lineHeight: 1, letterSpacing: "-0.04em" }}>{count}</Typography>
          {trend !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px", mb: "3px", color: isPos ? "#22C55E" : "#EF4444" }}>
              {isPos ? <IcoTrendUp /> : <IcoTrendDn />}
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "inherit" }}>{isPos ? "+" : ""}{trend}%</Typography>
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{description}</Typography>
      </Box>
    </Paper>
  );
}

// ══════════════════════════════════════════════════════════════
//  DonutChart
// ══════════════════════════════════════════════════════════════
export function DonutChart({ segments, total, size = 110 }) {
  const [hov, setHov] = useState(null);
  const sw = 12, gap = 3, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const valid = segments.filter((s) => s.value > 0);
  const tot   = valid.reduce((a, s) => a + s.value, 0) || 1;
  const gapF  = gap / 360;
  const fracs = valid.map((s) => (s.value / tot) * (1 - gapF * valid.length));
  const starts = fracs.reduce((acc, f, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + fracs[i - 1] + gapF);
    return acc;
  }, []);

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        {valid.map((seg, i) => {
          const dl  = fracs[i] * circ;
          const off = circ - starts[i] * circ;
          const isH = hov === i;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth={isH ? sw + 3 : sw}
              strokeDasharray={`${dl} ${circ - dl}`}
              strokeDashoffset={off} strokeLinecap="round"
              style={{ transition: "stroke-width 0.2s, opacity 0.2s", opacity: hov !== null && !isH ? 0.3 : 1, cursor: "pointer", filter: isH ? `drop-shadow(0 0 5px ${seg.color}88)` : "none" }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            />
          );
        })}
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
        {hov !== null ? (
          <>
            <Typography sx={{ fontSize: "18px", fontWeight: 900, color: valid[hov]?.color, lineHeight: 1 }}>{valid[hov]?.value}</Typography>
            <Typography sx={{ fontSize: "8px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mt: "1px" }}>tickets</Typography>
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: "20px", fontWeight: 900, color: "#111827", lineHeight: 1 }}>{total}</Typography>
            <Typography sx={{ fontSize: "8px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mt: "1px" }}>total</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════
//  CreatedVsResolvedChart  (Option C — remplace GroupedBarChart)
//  2 barres par mois : Créés (bleu) vs Résolus (vert)
//  Si résolus > créés → équipe en avance (bon signe ✓)
// ══════════════════════════════════════════════════════════════
export function CreatedVsResolvedChart({ data }) {
  const [hov, setHov] = useState(null);
  const maxVal = Math.max(...data.flatMap((d) => [d.created, d.resolved]), 1);
  const H = 110;

  const bars = [
    { key: "created",  color: "#3B82F6", label: "Créés"   },
    { key: "resolved", color: "#22C55E", label: "Résolus" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "10px", height: H, position: "relative" }}>
        {[0.25, 0.5, 0.75, 1].map((l) => (
          <Box key={l} sx={{ position: "absolute", left: 0, right: 0, bottom: `${l * 100}%`, height: "1px", backgroundColor: "#F3F4F6", pointerEvents: "none" }} />
        ))}
        {data.map((d, mi) => (
          <Box key={mi} sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px", position: "relative" }}>
            {bars.map((b) => {
              const h   = Math.max((d[b.key] / maxVal) * H, 3);
              const isH = hov?.mi === mi && hov?.key === b.key;
              return (
                <Box key={b.key}
                  onMouseEnter={() => setHov({ mi, key: b.key, val: d[b.key], label: d.label, series: b.label })}
                  onMouseLeave={() => setHov(null)}
                  sx={{
                    width: 9, height: h, borderRadius: "3px 3px 2px 2px",
                    backgroundColor: b.color,
                    opacity: hov && !(hov.mi === mi && hov.key === b.key) ? 0.22 : 1,
                    transform: isH ? "scaleY(1.07)" : "scaleY(1)",
                    transformOrigin: "bottom",
                    transition: "opacity 0.15s, transform 0.15s",
                    cursor: "default",
                  }}
                />
              );
            })}
            {/* Badge delta : résolus > créés = bon signe */}
            {d.resolved > d.created && (
              <Box sx={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: "#22C55E", fontWeight: 800 }}>✓</Box>
            )}
            {hov?.mi === mi && (
              <Box sx={{
                position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
                backgroundColor: "#111827", color: "#fff", borderRadius: "7px", padding: "4px 9px",
                fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                "&::after": { content: '""', position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", border: "4px solid transparent", borderTopColor: "#111827" },
              }}>
                {hov.label} · {hov.series} : {hov.val}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Labels mois */}
      <Box sx={{ display: "flex", gap: "10px", mt: "5px" }}>
        {data.map((d, i) => (
          <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF" }}>{d.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Légende */}
      <Box sx={{ display: "flex", gap: "16px", mt: "10px", justifyContent: "center" }}>
        {bars.map((b) => (
          <Box key={b.key} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: b.color }} />
            <Typography sx={{ fontSize: "10px", color: "#6B7280", fontWeight: 500 }}>{b.label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Typography sx={{ fontSize: "10px", color: "#22C55E", fontWeight: 800 }}>✓</Typography>
          <Typography sx={{ fontSize: "10px", color: "#6B7280", fontWeight: 500 }}>Backlog résorbé</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════
//  AreaLineChart
// ══════════════════════════════════════════════════════════════
export function AreaLineChart({ data, color }) {
  const [hov, setHov] = useState(null);
  const W = 460, H = 130;
  const PAD = { t: 14, r: 10, b: 16, l: 10 };
  const iW  = W - PAD.l - PAD.r;
  const iH  = H - PAD.t - PAD.b;
  const values = data.map((d) => d.created + d.resolved);
  const max    = Math.max(...values, 1);
  const pts    = values.map((v, i) => ({
    x: PAD.l + (i / (values.length - 1)) * iW,
    y: PAD.t + iH - (v / max) * iH,
  }));
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${lineD} L${PAD.l + iW},${PAD.t + iH} L${PAD.l},${PAD.t + iH} Z`;
  const gId   = `al${color.replace("#", "")}`;

  return (
    <Box sx={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((l) => (
          <line key={l} x1={PAD.l} y1={PAD.t + iH * (1 - l)} x2={PAD.l + iW} y2={PAD.t + iH * (1 - l)} stroke="#F3F4F6" strokeWidth="1" />
        ))}
        <path d={areaD} fill={`url(#${gId})`} />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hov === i ? 5.5 : 3.5}
              fill={hov === i ? color : "#fff"} stroke={color} strokeWidth="2"
              style={{ transition: "r 0.15s" }}
            />
          </g>
        ))}
        {hov !== null && (() => {
          const p   = pts[hov];
          const txt = `${data[hov].label}  ${values[hov]} tickets`;
          const bw  = txt.length * 6 + 18;
          const bx  = Math.min(Math.max(p.x - bw / 2, 2), W - bw - 2);
          const by  = p.y - 30;
          return (
            <g pointerEvents="none">
              <rect x={bx} y={by} width={bw} height={20} rx="6" fill="#111827" />
              <text x={bx + bw / 2} y={by + 13} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">{txt}</text>
            </g>
          );
        })()}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H} textAnchor="middle"
            fill={hov === i ? color : "#9CA3AF"}
            fontSize="9.5" fontWeight={hov === i ? "700" : "500"}
            fontFamily="Inter, sans-serif"
            style={{ transition: "fill 0.15s" }}>
            {data[i].label}
          </text>
        ))}
      </svg>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════
//  StackedPriorityBar
// ══════════════════════════════════════════════════════════════
export function StackedPriorityBar({ counts, total }) {
  const [hov, setHov] = useState(null);
  const priorities = [
    { key: "critical", label: "Critique", color: "#EF4444" },
    { key: "high",     label: "Haute",    color: "#F59E0B" },
    { key: "medium",   label: "Moyenne",  color: "#3B82F6" },
    { key: "low",      label: "Basse",    color: "#22C55E" },
  ];
  return (
    <Box>
      <Box sx={{ display: "flex", height: 13, borderRadius: "999px", overflow: "hidden", gap: "2px", mb: "14px" }}>
        {priorities.map((p) => {
          const pct = total > 0 ? (counts[p.key] / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <Box key={p.key}
              onMouseEnter={() => setHov(p.key)} onMouseLeave={() => setHov(null)}
              sx={{
                width: `${pct}%`, backgroundColor: p.color,
                opacity: hov && hov !== p.key ? 0.28 : 1,
                transform: hov === p.key ? "scaleY(1.18)" : "scaleY(1)",
                transformOrigin: "center", transition: "opacity 0.15s, transform 0.15s",
                borderRadius: "2px", cursor: "default",
              }}
            />
          );
        })}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
        {priorities.map((p) => {
          const pct = total > 0 ? Math.round((counts[p.key] / total) * 100) : 0;
          const isH = hov === p.key;
          return (
            <Box key={p.key}
              onMouseEnter={() => setHov(p.key)} onMouseLeave={() => setHov(null)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 10px", borderRadius: "9px",
                backgroundColor: isH ? `${p.color}0F` : "#FAFAFA",
                border: `1px solid ${isH ? p.color + "44" : "#F3F4F6"}`,
                transition: "all 0.15s", cursor: "default",
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: p.color }} />
                <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#374151" }}>{p.label}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: p.color }}>{counts[p.key]}</Typography>
                <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{pct}%</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}