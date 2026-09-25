import { createContext, useContext, useState, useCallback } from "react";
import { computeAssessmentResult } from "../data/questions";

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  
  const [selectedCareerId, setSelectedCareerIdState] = useState(
    () => localStorage.getItem("selectedCareerId") || null
  );

  const setSelectedCareerId = useCallback((careerId) => {
    setSelectedCareerIdState(careerId);

    if (careerId) {
      localStorage.setItem("selectedCareerId", careerId);
    } else {
      localStorage.removeItem("selectedCareerId");
    }
  }, []);

  const [compareIds, setCompareIds] = useState([]);

  const answerQuestion = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const finishAssessment = useCallback(() => {
    setResult(computeAssessmentResult(answers));
  }, [answers]);

  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  return (
    <AssessmentContext.Provider
      value={{
        answers,
        answerQuestion,
        result,
        finishAssessment,
        selectedCareerId,
        setSelectedCareerId,
        compareIds,
        toggleCompare,
        setCompareIds,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
};
