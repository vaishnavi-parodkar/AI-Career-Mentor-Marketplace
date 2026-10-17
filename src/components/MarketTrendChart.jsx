import { useMemo, useState } from "react";

const ALL_YEARS = [2021, 2022, 2023, 2024, 2025];
const RANGES = [["3Y", 3], ["5Y", 5]];

/** Interactive trend chart: range toggle, hover/focus tooltip, year-over-year change and growth summary. */
export default function MarketTrendChart({ values = [], title }) {
  const [range, setRange] = useState(5);
  const [hover, setHover] = useState(null);
  const shown = useMemo(() => values.slice(-range), [values, range]);
  const years = ALL_YEARS.slice(-shown.length);
  const max = Math.max(...shown), min = Math.min(...shown);
  const pad = Math.max((max - min) * 0.18, 4);
  const lo = min - pad, hi = max + pad;
  const W = 380, H = 200, L = 36, R = 360, T = 24, B = 160;
  const px = (i) => (shown.length === 1 ? (L + R) / 2 : L + (i * (R - L)) / (shown.length - 1));
  const py = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
  const pts = shown.map((v, i) => [px(i), py(v)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${L},${B} ${line} ${R},${B}`;
  const first = shown[0], last = shown[shown.length - 1];
  const cagr = shown.length > 1 ? (Math.pow(last / first, 1 / (shown.length - 1)) - 1) * 100 : 0;
  const active = hover ?? shown.length - 1;
  const yoy = (i) => (i > 0 ? Math.round(((shown[i] - shown[i - 1]) / shown[i - 1]) * 100) : null);
  const ticks = [0, 1, 2, 3].map((k) => Math.round(lo + ((hi - lo) * k) / 3));

  return (
    <div className="rounded-xl border border-border bg-off-white p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-meta text-coral">{years[0]}–{years[years.length - 1]}</p>
          <h3 className="mt-1 font-heading text-2xl font-bold leading-tight text-dark-green">{title} market trend</h3>
        </div>
        <div className="flex rounded-full border border-border p-0.5" role="group" aria-label="Chart range">
          {RANGES.map(([label, n]) => (
            <button key={label} type="button" onClick={() => { setRange(n); setHover(null); }} aria-pressed={range === n}
              className={`focus-ring min-h-8 rounded-full px-3 text-xs font-semibold ${range === n ? "bg-dark-green text-off-white" : "text-text-muted hover:bg-light-sage"}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-light-sage/60 p-2"><p className="type-meta">{years[active]}</p><p className="font-heading text-xl font-bold text-dark-green">{shown[active]}</p></div>
        <div className="rounded-lg bg-light-sage/60 p-2"><p className="type-meta">Year on year</p><p className={`font-heading text-xl font-bold ${yoy(active) < 0 ? "text-coral" : "text-dark-green"}`}>{yoy(active) == null ? "-" : `${yoy(active) > 0 ? "+" : ""}${yoy(active)}%`}</p></div>
        <div className="rounded-lg bg-light-sage/60 p-2"><p className="type-meta">Avg growth / yr</p><p className="font-heading text-xl font-bold text-dark-green">{cagr >= 0 ? "+" : ""}{cagr.toFixed(1)}%</p></div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title} trend index from ${years[0]} to ${years[years.length - 1]}: ${shown.join(", ")}`} onMouseLeave={() => setHover(null)}>
        <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0A634D" stopOpacity="0.25" /><stop offset="100%" stopColor="#0A634D" stopOpacity="0" /></linearGradient></defs>
        {ticks.map((t) => (<g key={t}><line x1={L} x2={R} y1={py(t)} y2={py(t)} stroke="#E5DFCF" /><text x={L - 6} y={py(t) + 3} textAnchor="end" fontSize="9" fill="#5B655F">{t}</text></g>))}
        <polygon points={area} fill="url(#trendFill)" />
        <polyline key={range} points={line} fill="none" stroke="#064C3B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" className="trend-draw" />
        {hover != null && <line x1={px(hover)} x2={px(hover)} y1={T} y2={B} stroke="#AABF78" strokeDasharray="3 3" />}
        {shown.map((v, i) => (
          <g key={years[i]} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} role="button" aria-label={`${years[i]}: index ${v}`} className="outline-none">
            <rect x={px(i) - 24} y={T - 10} width="48" height={B - T + 40} fill="transparent" />
            <circle cx={px(i)} cy={py(v)} r={i === active ? 7 : 5} fill={i === active ? "#E9877B" : "#064C3B"} stroke="#FFFDF8" strokeWidth="2" style={{ transition: "r .15s" }} />
            <text x={px(i)} y={py(v) - 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#064C3B">{v}</text>
            <text x={px(i)} y={B + 18} textAnchor="middle" fontSize="10" fill={i === active ? "#064C3B" : "#5B655F"} fontWeight={i === active ? 700 : 400}>{years[i]}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-text-muted">Normalised index (2021 = 100). Hover or tab through the points for year-on-year change.</p>
      <style>{`.trend-draw{animation:trendDraw .9s ease forwards}@keyframes trendDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.trend-draw{animation:none;stroke-dashoffset:0}}`}</style>
    </div>
  );
}
