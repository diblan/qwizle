package com.qwizle.api.questions;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record SubmitQuestionAttemptRequest(
        @NotNull(message = "Question type is required.")
        QuestionType type,

        @NotNull(message = "Question response is required.")
        JsonNode response) {
}
