import { CheckCircle2, Map, Mic, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import MatchRing from "../components/MatchRing";

const stats = [
  { icon: CheckCircle2, label: "Assessment Completion", value: 100 },
  { icon: TrendingUp, label: "Skills Progress", value: 62 },
  { icon: Map, label: "Roadmap Progress", value: 40 },
  { icon: Mic, label: "Mock Interviews Completed", value: 1, isCount: true, suffix: " of 3" },
];

export default function ProgressDashboard() {
  const readiness = 68;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Progress Dashboard</h1>
        <p className="text-sm text-text-muted">Track how ready you are for your target career.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 text-center lg:col-span-1">
          <MatchRing value={readiness} size={110} strokeWidth={8} />
          <div>
            <p className="font-heading text-lg font-bold text-dark-green">Career Readiness</p>
            <p className="text-sm text-text-muted">You're making great progress!</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {stats.map((s) => (
            <Card key={s.label}>
              <div className="mb-2 flex items-center gap-2 text-dark-green">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light-sage">
                  <s.icon size={16} />
                </span>
                <p className="text-sm font-semibold">{s.label}</p>
              </div>
              {s.isCount ? (
                <p className="font-heading text-2xl font-bold text-dark-green">
                  {s.value}
                  <span className="text-sm font-medium text-text-muted">{s.suffix}</span>
                </p>
              ) : (
                <>
                  <ProgressBar value={s.value} />
                  <p className="mt-1.5 text-right text-xs font-semibold text-dark-green">{s.value}%</p>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-light-sage/50">
        <h2 className="mb-1 font-heading text-lg font-bold text-dark-green">Keep going!</h2>
        <p className="text-sm text-text-dark/80">
          Complete your roadmap and finish 2 more mock interviews to boost your career
          readiness score.
        </p>
      </Card>
    </Layout>
  );
}
