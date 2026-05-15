package com.qwizle.api.questions;

import java.time.OffsetDateTime;

public record BasicQuestionResponse(
        Long id,
        String question,
        QuestionType type,
        int solutionCount,
        Long createdByUserId,
        OffsetDateTime createdAt) {
}
