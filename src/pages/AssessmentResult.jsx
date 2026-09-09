import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Sparkles, Compass, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAssessment } from "../context/AssessmentContext";

export default function AssessmentResult() {
  const navigate = useNavigate();
  const { result } = useAssessment();

  useEffect(() => {
    if (!result) navigate("/assessment");
  }, [result, navigate]);

  if (!result) return null;

  const rows = [
    { icon: Target, label: "Top Interest", value: result.topInterest },
    { icon: Sparkles, label: "Your Strengths", value: result.strengths },
    { icon: Compass, label: "Work Preference", value: result.workPreference },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-sage text-dark-green">
            <Sparkles size={30} />
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold text-dark-green">
            Your Assessment Summary
          </h1>
          <p className="text-text-muted">Here's what your responses reveal about you.</p>
        </div>

        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <Card key={row.label} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green">
                <row.icon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {row.label}
                </p>
                <p className="mt-0.5 font-medium text-text-dark">{row.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate("/careers")}
        >
          View Career Matches
        </Button>
      </div>
    </Layout>
  );
}
