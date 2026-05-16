package com.qwizle.api.questions;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuestionPrompt(
        @NotBlank(message = "Question prompt is required.")
        @Size(max = 1000, message = "Question prompt must be 1000 characters or fewer.")
        String text,

        List<@Valid ContentBlock> media) {
    public QuestionPrompt cleaned() {
        return new QuestionPrompt(text.trim(), media == null ? List.of() : List.copyOf(media));
    }
}
