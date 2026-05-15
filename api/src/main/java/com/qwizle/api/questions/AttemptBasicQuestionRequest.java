package com.qwizle.api.questions;

import java.util.List;

import jakarta.validation.constraints.Size;

public record AttemptBasicQuestionRequest(
        @Size(max = 1000, message = "Answer must be 1000 characters or fewer.")
        String answer,

        List<@Size(max = 1000, message = "Each set answer must be 1000 characters or fewer.") String> answers) {
    public AttemptBasicQuestionRequest(String answer) {
        this(answer, null);
    }
}
