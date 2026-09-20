import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import MarketTrendChart from "../components/MarketTrendChart";
import { marketInsights, marketThemes } from "../data/marketInsights";

const formatMarketChange = (values) => {
  if (!Array.isArray(values) || values.length < 2) return "Not available";
  const change = values[values.length - 1] - values[0];
  return `${change >= 0 ? "+" : ""}${change} index points`;
};

export default function MarketInsights() {
  const [careerId, setCareerId] = useState("data-analyst");
  const insight = marketInsights[careerId];
  const latestValue = insight.values[insight.values.length - 1];

  return <Layout><div className="mb-9 max-w-2xl"><p className="type-eyebrow">Pathwise market view</p><h1 className="mt-2 type-page-title">Market insights</h1><p className="mt-3 type-body">Explore the static normalized trend index and skills connected to each of Pathwise&apos;s six supported career paths.</p></div><div className="border-b border-border pb-6"><p className="mb-3 text-sm font-semibold text-dark-green">Choose a career</p><div className="flex flex-wrap gap-2" role="tablist" aria-label="Career market insights">{Object.entries(marketInsights).map(([id, item]) => <button key={id} type="button" role="tab" aria-selected={id === careerId} onClick={() => setCareerId(id)} className={`focus-ring min-h-10 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${id === careerId ? "border-dark-green bg-dark-green text-off-white" : "border-border bg-off-white text-text-dark hover:bg-light-sage"}`}>{item.title}</button>)}</div></div><div className="grid gap-8 border-b border-border py-9 lg:grid-cols-[1.35fr_0.65fr]"><MarketTrendChart values={insight.values} title={insight.title} /><div className="border-l-2 border-sage pl-5"><p className="type-eyebrow">Market direction</p><h2 className="mt-2 font-heading text-2xl font-bold text-dark-green">{insight.direction}</h2><p className="mt-4 type-supporting"><span className="font-semibold text-dark-green">Key trend:</span> {insight.trend}</p><div className="mt-6 grid grid-cols-2 gap-4"><div><p className="type-meta">Latest index</p><p className="mt-1 font-heading text-2xl font-bold text-dark-green">{latestValue}</p></div><div><p className="type-meta">Since 2021</p><p className="mt-1 font-heading text-lg font-bold text-dark-green">{formatMarketChange(insight.values)}</p></div></div><h3 className="mt-7 text-base font-bold text-dark-green">Key skills</h3><p className="mt-2 text-base leading-7 text-text-dark">{insight.skills.join(" · ")}</p></div></div><section className="border-b border-border py-9"><h2 className="type-section-title">What is shaping careers</h2><div className="mt-6 grid gap-6 sm:grid-cols-2">{marketThemes.map(([title, text]) => <div key={title} className="border-l-2 border-sage pl-4"><h3 className="text-base font-bold text-dark-green">{title}</h3><p className="mt-1 type-supporting">{text}</p></div>)}</div><p className="mt-8 text-sm leading-6 text-text-muted">Market trend values are normalized indicators used for visualization and are not absolute job-opening counts.</p></section><div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center"><p className="max-w-xl type-supporting">Use this view as context alongside the career information and your assessment—not as a promise of hiring outcomes.</p><Button variant="outline" icon={ArrowRight} iconPosition="right" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to selector</Button></div></Layout>;
}
