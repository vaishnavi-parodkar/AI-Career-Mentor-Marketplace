import { CheckCircle2, Map, Mic, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import MatchRing from "../components/MatchRing";

const stats = [
  { icon: CheckCircle2, label: "Assessment completion", value: 100 },
  { icon: TrendingUp, label: "Skills progress", value: 62 },
  { icon: Map, label: "Roadmap progress", value: 40 },
  { icon: Mic, label: "Mock interviews completed", value: 1, isCount: true, suffix: " of 3" },
];

export default function ProgressDashboard() {
  const readiness = 68;
  return <Layout><div className="mb-9"><p className="type-eyebrow">Your momentum</p><h1 className="mt-2 type-page-title">Progress dashboard</h1><p className="mt-3 type-body">Track how ready you are for your target career.</p></div><div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3"><Card className="flex flex-col items-center justify-center gap-4 text-center" elevated><MatchRing value={readiness} size={110} strokeWidth={8} /><div><p className="font-heading text-xl font-bold text-dark-green">Career readiness</p><p className="mt-1 type-supporting">You&apos;re making steady progress.</p></div></Card><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">{stats.map((stat) => <Card key={stat.label}><div className="mb-3 flex items-center gap-2 text-dark-green"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-sage"><stat.icon size={16} aria-hidden="true" /></span><p className="text-sm font-semibold">{stat.label}</p></div>{stat.isCount ? <p className="font-heading text-2xl font-bold text-dark-green">{stat.value}<span className="ml-1 text-sm font-medium text-text-muted">{stat.suffix}</span></p> : <><ProgressBar value={stat.value} label={`${stat.label} progress`} /><p className="mt-2 text-right text-sm font-semibold text-dark-green">{stat.value}%</p></>}</Card>)}</div></div><Card className="border-sage bg-light-sage/50"><h2 className="font-heading text-xl font-bold text-dark-green">Keep going</h2><p className="mt-2 type-supporting text-text-dark">Complete your roadmap and finish two more mock interviews to build your career readiness.</p></Card></Layout>;
}
