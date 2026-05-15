package com.qwizle.api.questions;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBasicQuestionRequest(
        @NotBlank(message = "Question is required.")
        @Size(max = 1000, message = "Question must be 1000 characters or fewer.")
        String question,

        @Size(max = 1000, message = "Answer must be 1000 characters or fewer.")
        String answer,

        QuestionType type,

        List<@NotBlank(message = "Set answers cannot be blank.") @Size(max = 1000, message = "Each set answer must be 1000 characters or fewer.") String> answers) {
    public CreateBasicQuestionRequest(String question, String answer) {
        this(question, answer, QuestionType.SINGLE_ANSWER, null);
    }
}
