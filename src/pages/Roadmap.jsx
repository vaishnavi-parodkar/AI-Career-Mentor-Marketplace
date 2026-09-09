import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { roadmapStages } from "../data/roadmap";

const statusStyles = {
  complete: { icon: CheckCircle2, color: "text-dark-green", bg: "bg-dark-green" },
  "in-progress": { icon: Clock, color: "text-coral", bg: "bg-coral" },
  upcoming: { icon: Circle, color: "text-text-muted", bg: "bg-border" },
};

export default function Roadmap() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Your Personalized Career Roadmap</h1>
        <p className="text-sm text-text-muted">
          Follow these stages to become job-ready, at your own pace.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        {roadmapStages.map((stage, i) => {
          const style = statusStyles[stage.status];
          const Icon = style.icon;
          const isLast = i === roadmapStages.length - 1;
          return (
            <div key={stage.id} className="relative flex gap-5 pb-10">
              {!isLast && (
                <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
              )}
              <div
                className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} text-off-white`}
              >
                <Icon size={19} />
              </div>
              <Card className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-dark-green">{stage.title}</h3>
                  <span className={`text-xs font-semibold capitalize ${style.color}`}>
                    {stage.status.replace("-", " ")}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{stage.description}</p>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Button variant="outline" size="lg" fullWidth onClick={() => navigate("/skill-gap")}>
          View Skill Gaps
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate("/mock-interview")}>
          Start Mock Interview
        </Button>
      </div>
    </Layout>
  );
}
