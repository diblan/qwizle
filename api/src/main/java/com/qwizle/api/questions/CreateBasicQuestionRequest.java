package com.qwizle.api.questions;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBasicQuestionRequest(
        @NotBlank(message = "Question is required.")
        @Size(max = 1000, message = "Question must be 1000 characters or fewer.")
        String question,

        @NotBlank(message = "Answer is required.")
        @Size(max = 1000, message = "Answer must be 1000 characters or fewer.")
        String answer) {
}
