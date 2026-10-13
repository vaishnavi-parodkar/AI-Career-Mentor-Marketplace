package com.aicareermentor.backend.dto;

import java.util.List;

/**
 * Request/response shapes for the mock interview feature.
 * Grouped in one file; nested records follow the style of SkillGapAnalyzeRequest.
 */
public final class MockInterviewDto {

    private MockInterviewDto() {
    }

    public record QuestionsRequest(
            String careerTitle,
            List<String> skills,
            Integer count
    ) {
    }

    public record GeneratedQuestion(
            String text,
            String category,
            String hint
    ) {
    }

    public record QuestionsResponse(
            List<GeneratedQuestion> questions
    ) {
    }

    public record AnswerInput(
            String question,
            String category,
            String answer
    ) {
    }

    public record EvaluateRequest(
            String careerTitle,
            List<AnswerInput> answers
    ) {
    }

    public record QuestionFeedback(
            Integer score,
            List<String> feedback
    ) {
    }

    public record EvaluationResponse(
            Integer communication,
            Integer technical,
            String summary,
            List<String> strengths,
            List<String> weaknesses,
            List<String> recommendations,
            List<QuestionFeedback> questions
    ) {
    }
}
