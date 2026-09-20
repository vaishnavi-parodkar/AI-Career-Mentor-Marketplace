import { useNavigate } from "react-router-dom";
import { BarChart3, Brain, Clock } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { questions } from "../data/questions";

export default function AssessmentIntro() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-light-sage text-dark-green">
          <Brain size={36} aria-hidden="true" />
        </div>
        <p className="type-eyebrow">Your starting point</p>
        <h1 className="mt-2 type-page-title">Career assessment</h1>
        <p className="mt-4 type-body">
          Answer honestly about how you think and work. Your responses are mapped to six supported career paths, and each match keeps the contributing traits in view.
        </p>

        <Button variant="primary" size="lg" fullWidth className="mt-7" onClick={() => navigate("/assessment/question")}>
          Start the assessment
        </Button>

        <div className="mt-8 grid grid-cols-3 divide-x divide-border border-y border-border py-5 text-left">
          <div className="px-3 text-center sm:px-5"><BarChart3 className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">{questions.length}</p><p className="type-meta">Questions</p></div>
          <div className="px-3 text-center sm:px-5"><Clock className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">10–15</p><p className="type-meta">Minutes</p></div>
          <div className="px-3 text-center sm:px-5"><Brain className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">1</p><p className="type-meta">Result</p></div>
        </div>
      </div>
    </Layout>
  );
}
