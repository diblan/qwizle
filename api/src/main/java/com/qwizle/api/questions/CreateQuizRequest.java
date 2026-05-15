package com.qwizle.api.questions;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuizRequest(
        @NotBlank(message = "Quiz title is required.")
        @Size(max = 160, message = "Quiz title must be 160 characters or fewer.")
        String title,

        @Size(max = 1000, message = "Quiz description must be 1000 characters or fewer.")
        String description,

        @NotEmpty(message = "Choose at least two questions for the quiz.")
        List<@NotNull(message = "Quiz question IDs are required.") Long> questionIds) {
}
