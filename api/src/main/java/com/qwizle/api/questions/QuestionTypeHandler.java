package com.qwizle.api.questions;

public interface QuestionTypeHandler<D, S> {
    QuestionType type();

    Class<D> definitionClass();

    Class<S> submissionClass();

    void validateDefinition(D definition);

    Object toLearnerInteraction(D definition);

    void validateSubmission(D definition, S submission);

    ScoringResult score(D definition, S submission);
}
