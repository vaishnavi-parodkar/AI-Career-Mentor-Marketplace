import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import CareerCard from "../components/CareerCard";
import EmptyState from "../components/EmptyState";
import { GitCompare } from "lucide-react";
import { careerApi } from "../services/api";
import { useAssessment } from "../context/AssessmentContext";

const metrics = [
  { key: "analytical", label: "Analytical" },
  { key: "technical", label: "Technical" },
  { key: "communication", label: "Communication" },
  { key: "leadership", label: "Leadership" },
];

export default function CompareCareers() {
  const { compareIds, toggleCompare } = useAssessment();
  const [careers, setCareers] = useState([]);
  const [showDetailed, setShowDetailed] = useState(false);
  useEffect(() => { careerApi.getAll().then(setCareers); }, []);
  const selected = careers.filter((career) => compareIds.includes(career.id));

  return <Layout><div className="mb-8"><p className="type-eyebrow">Decision support</p><h1 className="mt-2 type-page-title">Compare careers</h1><p className="mt-3 type-body">Select two or three paths to compare their shared dimensions side by side.</p></div><div className="mb-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{careers.map((career) => <CareerCard key={career.id} career={career} compareMode selected={compareIds.includes(career.id)} onToggleCompare={toggleCompare} />)}</div>{selected.length < 2 ? <EmptyState icon={GitCompare} title="Select at least two careers" description="Choose careers above to compare their work, skills, and growth side by side." /> : <Card elevated><h2 className="mb-6 font-heading text-2xl font-bold text-dark-green">{selected.map((career) => career.title).join(" vs ")}</h2><div className="mb-7 flex flex-col gap-7">{metrics.map((metric) => <div key={metric.key}><p className="mb-3 text-base font-semibold text-text-dark">{metric.label}</p><div className="flex flex-col gap-3">{selected.map((career) => <div key={career.id} className="flex items-center gap-3"><span className="w-28 shrink-0 truncate text-sm text-text-muted sm:w-36">{career.title}</span><ProgressBar value={career.scores?.[metric.key] ?? 0} label={`${career.title} ${metric.label} score`} className="flex-1" /><span className="w-8 text-right text-sm font-semibold text-dark-green">{career.scores?.[metric.key] ?? "—"}</span></div>)}</div></div>)}</div>{showDetailed && <div className="mb-7 grid grid-cols-1 gap-5 border-t border-border pt-7 sm:grid-cols-2 lg:grid-cols-3">{selected.map((career) => <div key={career.id} className="rounded-xl border border-border bg-cream p-5"><h3 className="mb-3 font-heading text-lg font-bold text-dark-green">{career.title}</h3><p className="type-meta">Responsibilities</p><ul className="mb-4 mt-1 list-disc pl-4 text-sm leading-6 text-text-dark">{career.responsibilities.slice(0, 2).map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul><p className="type-meta">Career growth</p><p className="mb-4 mt-1 text-sm leading-6 text-text-dark">{career.growth}</p><p className="type-meta">Salary range</p><p className="mt-1 text-sm font-semibold text-dark-green">{career.salaryRange}</p></div>)}</div>}<Button variant="primary" fullWidth onClick={() => setShowDetailed((current) => !current)}>{showDetailed ? "Hide detailed comparison" : "View detailed comparison"}</Button></Card>}</Layout>;
}
