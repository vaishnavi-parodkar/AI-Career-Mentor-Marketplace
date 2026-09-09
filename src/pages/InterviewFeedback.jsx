import { useNavigate } from "react-router-dom";
import { Award, ThumbsUp, AlertTriangle, MessageSquare, Cpu, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import MatchRing from "../components/MatchRing";
import ProgressBar from "../components/ProgressBar";

const feedback = {
  overall: 78,
  communication: 82,
  technical: 74,
  strengths: [
    "Clear and structured explanations",
    "Good use of real examples",
    "Confident tone throughout",
  ],
  weaknesses: [
    "Answers could be more concise",
    "Add more quantifiable outcomes",
  ],
  recommendations: [
    "Practice the STAR method for behavioral questions",
    "Prepare 2–3 metrics-driven examples from past projects",
    "Work on pacing — aim for 90 second answers",
  ],
};

export default function InterviewFeedback() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-light-sage text-dark-green">
            <Award size={30} />
          </div>
          <h1 className="mb-1 font-heading text-2xl font-bold text-dark-green sm:text-3xl">
            Interview Feedback
          </h1>
          <p className="text-sm text-text-muted">Here's how you performed in your mock interview.</p>
        </div>

        <Card className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <MatchRing value={feedback.overall} size={72} />
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Overall Score</p>
              <p className="font-heading text-xl font-bold text-dark-green">Good Performance</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/mock-interview")}>
            Retake Interview
          </Button>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-2 flex items-center gap-2 text-dark-green">
              <MessageSquare size={17} />
              <p className="text-sm font-semibold">Communication</p>
            </div>
            <ProgressBar value={feedback.communication} />
            <p className="mt-1.5 text-right text-xs font-semibold text-dark-green">
              {feedback.communication}%
            </p>
          </Card>
          <Card>
            <div className="mb-2 flex items-center gap-2 text-dark-green">
              <Cpu size={17} />
              <p className="text-sm font-semibold">Technical Knowledge</p>
            </div>
            <ProgressBar value={feedback.technical} />
            <p className="mt-1.5 text-right text-xs font-semibold text-dark-green">
              {feedback.technical}%
            </p>
          </Card>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-green">
              <ThumbsUp size={17} />
              <p className="text-sm font-semibold text-dark-green">Strengths</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-text-dark/85">
              {feedback.strengths.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2 text-coral">
              <AlertTriangle size={17} />
              <p className="text-sm font-semibold text-dark-green">Areas to Improve</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-text-dark/85">
              {feedback.weaknesses.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mb-6">
          <h2 className="mb-3 font-heading text-base font-bold text-dark-green">Recommendations</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-text-dark/85">
            {feedback.recommendations.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {r}
              </li>
            ))}
          </ul>
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate("/progress")}
        >
          View Progress Dashboard
        </Button>
      </div>
    </Layout>
  );
}
