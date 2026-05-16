package com.qwizle.api.questions;

import java.time.OffsetDateTime;
import java.util.List;

public record QuestionResponse(
        Long id,
        QuestionType type,
        QuestionPrompt prompt,
        Object interaction,
        String difficulty,
        List<String> tags,
        Long createdByUserId,
        OffsetDateTime createdAt) {
}
