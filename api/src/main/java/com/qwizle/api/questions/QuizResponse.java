package com.qwizle.api.questions;

import java.time.OffsetDateTime;
import java.util.List;

public record QuizResponse(
        Long id,
        String title,
        String description,
        int questionCount,
        List<QuestionResponse> questions,
        Long createdByUserId,
        OffsetDateTime createdAt) {
}
