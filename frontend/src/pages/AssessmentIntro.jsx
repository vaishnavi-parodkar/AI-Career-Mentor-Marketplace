import { useNavigate } from "react-router-dom";
import { BarChart3, Brain, Clock } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { questions } from "../data/questions";

export default function AssessmentIntro() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="text-center lg:text-left">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-light-sage text-dark-green">
          <Brain size={36} aria-hidden="true" />
        </div>
        <p className="type-eyebrow">Your starting point</p>
        <h1 className="mt-2 type-page-title">Career assessment</h1>
        <p className="mt-4 type-body">
          Answer honestly about how you think and work. Your responses are mapped to six supported career paths, and each match keeps the contributing traits in view.
        </p>

        <Button variant="primary" size="lg" className="mt-7 w-full sm:w-auto" onClick={() => navigate("/assessment/question")}>
          Start the assessment
        </Button>

        </div>
        <div className="rounded-2xl border border-border bg-off-white p-6 shadow-card sm:p-8">
          <p className="type-eyebrow">What you’ll get</p>
          <h2 className="mt-2 type-section-title">A clearer direction, grounded in your answers.</h2>
          <p className="mt-3 type-supporting">There are no right or wrong answers. Choose what feels most like you so your result reflects your working style and motivations.</p>
        <div className="mt-8 grid grid-cols-3 divide-x divide-border border-y border-border py-5 text-left">
          <div className="px-3 text-center sm:px-5"><BarChart3 className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">{questions.length}</p><p className="type-meta">Questions</p></div>
          <div className="px-3 text-center sm:px-5"><Clock className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">10–15</p><p className="type-meta">Minutes</p></div>
          <div className="px-3 text-center sm:px-5"><Brain className="mx-auto mb-2 text-coral" size={21} aria-hidden="true" /><p className="font-heading text-lg font-bold text-dark-green">1</p><p className="type-meta">Result</p></div>
        </div></div></div>
      </div>
    </Layout>
  );
}
