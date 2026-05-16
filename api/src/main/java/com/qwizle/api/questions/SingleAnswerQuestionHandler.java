package com.qwizle.api.questions;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class SingleAnswerQuestionHandler extends QuestionHandlerSupport
        implements QuestionTypeHandler<SingleAnswerDefinition, SingleAnswerSubmission> {
    @Override
    public QuestionType type() {
        return QuestionType.SINGLE_ANSWER;
    }

    @Override
    public Class<SingleAnswerDefinition> definitionClass() {
        return SingleAnswerDefinition.class;
    }

    @Override
    public Class<SingleAnswerSubmission> submissionClass() {
        return SingleAnswerSubmission.class;
    }

    @Override
    public void validateDefinition(SingleAnswerDefinition definition) {
        if (definition == null) {
            QuestionValidation.badRequest("Question definition is required.");
        }
        List<String> answers = answerTexts(definition.acceptedAnswers(), "Accepted answers");
        ensureUniqueNormalized(answers, definition.normalization(), "Accepted answers must be unique after normalization.");
    }

    @Override
    public Object toLearnerInteraction(SingleAnswerDefinition definition) {
        return new TextInteraction("TEXT", 1, 1);
    }

    @Override
    public void validateSubmission(SingleAnswerDefinition definition, SingleAnswerSubmission submission) {
        if (submission == null) {
            QuestionValidation.badRequest("Question response is required.");
        }
        QuestionValidation.requireCleanText(submission.text(), "Submitted answer");
    }

    @Override
    public ScoringResult score(SingleAnswerDefinition definition, SingleAnswerSubmission submission) {
        String submitted = TextAnswerNormalizer.normalize(submission.text(), definition.normalization());
        boolean correct = answerTexts(definition.acceptedAnswers(), "Accepted answers").stream()
                .map(answer -> TextAnswerNormalizer.normalize(answer, definition.normalization()))
                .anyMatch(answer -> answer.equals(submitted));
        return ScoringResult.allOrNothing(correct, new SingleAnswerSolution(type(), answerTexts(definition.acceptedAnswers(), "Accepted answers")));
    }
}
