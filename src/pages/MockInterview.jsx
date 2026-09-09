import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { interviewQuestions } from "../data/roadmap";
import { skillGap } from "../data/roadmap";

export default function MockInterview() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);

  const isLast = index === interviewQuestions.length - 1;

  const handleNext = () => {
    setAnswers((a) => [...a, answer]);
    setAnswer("");
    if (isLast) {
      navigate("/interview-feedback");
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-light-sage px-3 py-1 text-xs font-semibold text-dark-green">
            <Mic size={13} /> Mock Interview · {skillGap.career}
          </span>
          <h1 className="font-heading text-2xl font-bold text-dark-green sm:text-3xl">
            Practice Interview
          </h1>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-xs font-semibold text-text-muted">
            <span>
              Question {index + 1} of {interviewQuestions.length}
            </span>
            <span>{Math.round(((index + 1) / interviewQuestions.length) * 100)}%</span>
          </div>
          <ProgressBar value={index + 1} max={interviewQuestions.length} />
        </div>

        <Card className="mb-5">
          <p className="font-heading text-lg font-semibold text-dark-green">
            {interviewQuestions[index]}
          </p>
        </Card>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border border-border bg-off-white p-4 text-sm text-text-dark outline-none focus:border-dark-green"
        />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleNext}
          disabled={!answer.trim()}
        >
          {isLast ? "Finish Interview" : "Next Question"}
        </Button>
      </div>
    </Layout>
  );
}
