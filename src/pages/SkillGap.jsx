import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { skillGap } from "../data/roadmap";

export default function SkillGap() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Skill Gap Analysis</h1>
        <p className="text-sm text-text-muted">
          Based on your target career: <span className="font-semibold text-dark-green">{skillGap.career}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-heading text-lg font-bold text-dark-green">Current vs Required Skills</h2>
          <div className="flex flex-col gap-5">
            {skillGap.required.map((req) => {
              const current = skillGap.current.find((c) => c.name === req.name);
              const currentLevel = current?.level || 0;
              const gap = req.level - currentLevel;
              return (
                <div key={req.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-text-dark">{req.name}</span>
                    <span className="text-xs text-text-muted">
                      {currentLevel}% → {req.level}%{gap > 0 && ` (gap: ${gap}%)`}
                    </span>
                  </div>
                  <div className="relative">
                    <ProgressBar value={req.level} color="bg-light-sage" trackColor="bg-border/40" />
                    <div className="absolute inset-0">
                      <ProgressBar value={currentLevel} color="bg-dark-green" trackColor="bg-transparent" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-dark-green" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-light-sage" /> Required
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-heading text-lg font-bold text-dark-green">
            Recommended Learning Areas
          </h2>
          <div className="flex flex-col gap-3">
            {skillGap.recommended.map((area) => (
              <div
                key={area}
                className="flex items-center gap-3 rounded-xl border border-border bg-cream px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-sage text-dark-green">
                  <BookOpen size={16} />
                </span>
                <span className="text-sm font-medium text-text-dark">{area}</span>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            fullWidth
            className="mt-6"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate("/roadmap")}
          >
            View My Roadmap
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
