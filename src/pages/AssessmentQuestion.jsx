import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { questions, options } from "../data/questions";
import { useAssessment } from "../context/AssessmentContext";

export default function AssessmentQuestion() {
  const navigate = useNavigate();
  const { answers, answerQuestion, finishAssessment } = useAssessment();
  const [index, setIndex] = useState(0);

  const question = questions[index];
  const selected = answers[question.id];
  const isLast = index === questions.length - 1;

  const handleSelect = (value) => {
    answerQuestion(question.id, value);
  };

  const handleNext = () => {
    if (isLast) {
      finishAssessment();
      navigate("/assessment/result");
      return;
    }
    setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index === 0) {
      navigate("/assessment");
      return;
    }
    setIndex((i) => i - 1);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm font-semibold text-text-muted">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
          </div>
          <ProgressBar value={index + 1} max={questions.length} />
        </div>

        <Card className="mb-6 min-h-[120px] flex items-center justify-center px-6 py-10 text-center">
          <h2 className="font-heading text-xl font-semibold text-dark-green sm:text-2xl">
            "{question.text}"
          </h2>
        </Card>

        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`rounded-xl border px-5 py-4 text-left text-sm font-medium transition-colors sm:text-base ${
                selected === opt.value
                  ? "border-dark-green bg-light-sage text-dark-green"
                  : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" size="lg" icon={ChevronLeft} onClick={handlePrev}>
            Previous
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={ChevronRight}
            iconPosition="right"
            onClick={handleNext}
            disabled={selected === undefined}
          >
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
