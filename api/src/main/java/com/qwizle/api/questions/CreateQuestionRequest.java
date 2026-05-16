package com.qwizle.api.questions;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuestionRequest(
        @NotNull(message = "Question type is required.")
        QuestionType type,

        @NotNull(message = "Question prompt is required.")
        @Valid
        QuestionPrompt prompt,

        @NotNull(message = "Question definition is required.")
        JsonNode definition,

        @Size(max = 2000, message = "Explanation must be 2000 characters or fewer.")
        String explanation,

        @Size(max = 40, message = "Difficulty must be 40 characters or fewer.")
        String difficulty,

        List<@Size(max = 80, message = "Tags must be 80 characters or fewer.") String> tags) {
}
