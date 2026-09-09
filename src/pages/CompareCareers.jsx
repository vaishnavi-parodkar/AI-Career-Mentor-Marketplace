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

  useEffect(() => {
    careerApi.getAll().then(setCareers);
  }, []);

  const selected = careers.filter((c) => compareIds.includes(c.id));

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Compare Careers</h1>
        <p className="text-sm text-text-muted">
          Select 2–3 careers below to compare them side by side.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((c) => (
          <CareerCard
            key={c.id}
            career={c}
            compareMode
            selected={compareIds.includes(c.id)}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>

      {selected.length < 2 ? (
        <EmptyState
          icon={GitCompare}
          title="Select at least 2 careers"
          description="Choose careers above to see a detailed side-by-side comparison."
        />
      ) : (
        <Card>
          <h2 className="mb-5 font-heading text-lg font-bold text-dark-green">
            {selected.map((c) => c.title).join(" vs ")}
          </h2>

          <div className="mb-6 flex flex-col gap-6">
            {metrics.map((metric) => (
              <div key={metric.key}>
                <p className="mb-2 text-sm font-semibold text-text-dark">{metric.label}</p>
                <div className="flex flex-col gap-2">
                  {selected.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-xs text-text-muted sm:w-36">
                        {c.title}
                      </span>
                      <ProgressBar value={c.scores[metric.key]} className="flex-1" />
                      <span className="w-8 text-right text-xs font-semibold text-dark-green">
                        {c.scores[metric.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showDetailed && (
            <div className="mb-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {selected.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-cream p-4">
                  <h3 className="mb-2 font-heading text-base font-bold text-dark-green">{c.title}</h3>
                  <p className="mb-2 text-xs font-semibold text-text-muted">Responsibilities</p>
                  <ul className="mb-3 list-disc pl-4 text-xs text-text-dark/80">
                    {c.responsibilities.slice(0, 2).map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <p className="mb-1 text-xs font-semibold text-text-muted">Career Growth</p>
                  <p className="mb-3 text-xs text-text-dark/80">{c.growth}</p>
                  <p className="mb-1 text-xs font-semibold text-text-muted">Salary Range</p>
                  <p className="text-xs font-semibold text-dark-green">{c.salaryRange}</p>
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" fullWidth onClick={() => setShowDetailed((s) => !s)}>
            {showDetailed ? "Hide Detailed Comparison" : "View Detailed Comparison"}
          </Button>
        </Card>
      )}
    </Layout>
  );
}
