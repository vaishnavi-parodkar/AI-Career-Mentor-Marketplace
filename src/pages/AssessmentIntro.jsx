import { useNavigate } from "react-router-dom";
import { Brain, Clock, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { questions } from "../data/questions";

export default function AssessmentIntro() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-light-sage text-dark-green">
          <Brain size={36} />
        </div>
        <h1 className="mb-3 font-heading text-3xl font-bold text-dark-green sm:text-4xl">
          AI Career Assessment
        </h1>
        <p className="mb-8 text-text-muted">
          Answer a few honest questions about how you think and work. Our AI
          will analyze your responses to reveal careers that truly fit you.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex flex-col items-center gap-2 py-6">
            <Sparkles className="text-coral" size={22} />
            <p className="font-heading text-lg font-bold text-dark-green">{questions.length}</p>
            <p className="text-xs text-text-muted">Questions</p>
          </Card>
          <Card className="flex flex-col items-center gap-2 py-6">
            <Clock className="text-coral" size={22} />
            <p className="font-heading text-lg font-bold text-dark-green">10–15</p>
            <p className="text-xs text-text-muted">Minutes</p>
          </Card>
          <Card className="flex flex-col items-center gap-2 py-6">
            <Brain className="text-coral" size={22} />
            <p className="font-heading text-lg font-bold text-dark-green">1</p>
            <p className="text-xs text-text-muted">Personalized Result</p>
          </Card>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={() => navigate("/assessment/question")}>
          Start Assessment
        </Button>
      </div>
    </Layout>
  );
}
