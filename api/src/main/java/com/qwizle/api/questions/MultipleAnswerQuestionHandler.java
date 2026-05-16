package com.qwizle.api.questions;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class MultipleAnswerQuestionHandler extends QuestionHandlerSupport
        implements QuestionTypeHandler<MultipleAnswerDefinition, MultipleAnswerSubmission> {
    @Override
    public QuestionType type() {
        return QuestionType.MULTIPLE_ANSWER;
    }

    @Override
    public Class<MultipleAnswerDefinition> definitionClass() {
        return MultipleAnswerDefinition.class;
    }

    @Override
    public Class<MultipleAnswerSubmission> submissionClass() {
        return MultipleAnswerSubmission.class;
    }

    @Override
    public void validateDefinition(MultipleAnswerDefinition definition) {
        if (definition == null) {
            QuestionValidation.badRequest("Question definition is required.");
        }
        if (definition.mode() == null) {
            QuestionValidation.badRequest("Multiple-answer mode is required.");
        }
        List<String> answers = answerTexts(definition.answers(), "Answers");
        if (answers.size() < 2) {
            QuestionValidation.badRequest("Multiple-answer questions require at least two answers.");
        }
        ensureUniqueNormalized(answers, definition.normalization(), "Multiple-answer answers must be unique after normalization.");
    }

    @Override
    public Object toLearnerInteraction(MultipleAnswerDefinition definition) {
        int answerCount = definition.mode() == MultipleAnswerMode.ONE_OF_ACCEPTED ? 1 : definition.answers().size();
        return new TextInteraction("TEXT_LIST", answerCount, answerCount);
    }

    @Override
    public void validateSubmission(MultipleAnswerDefinition definition, MultipleAnswerSubmission submission) {
        if (submission == null) {
            QuestionValidation.badRequest("Question response is required.");
        }
        List<String> submitted = cleanTexts(submission.answers(), "Submitted answers");
        int expectedCount = definition.mode() == MultipleAnswerMode.ONE_OF_ACCEPTED ? 1 : definition.answers().size();
        if (submitted.size() != expectedCount) {
            QuestionValidation.badRequest("Submit exactly " + expectedCount + " answers.");
        }
        ensureUniqueNormalized(submitted, definition.normalization(), "Submitted answers must be unique.");
    }

    @Override
    public ScoringResult score(MultipleAnswerDefinition definition, MultipleAnswerSubmission submission) {
        List<String> expected = answerTexts(definition.answers(), "Answers");
        List<String> submitted = cleanTexts(submission.answers(), "Submitted answers");
        boolean correct = definition.mode() == MultipleAnswerMode.ONE_OF_ACCEPTED
                ? normalizedSet(expected, definition.normalization()).contains(TextAnswerNormalizer.normalize(submitted.getFirst(), definition.normalization()))
                : normalizedSet(expected, definition.normalization()).equals(normalizedSet(submitted, definition.normalization()));
        return ScoringResult.allOrNothing(correct, new MultipleAnswerSolution(type(), definition.mode(), expected));
    }
}
