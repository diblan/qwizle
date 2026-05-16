package com.qwizle.api.questions;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record QuestionAttemptResponse(
        Long attemptId,
        Long questionId,
        boolean correct,
        BigDecimal score,
        BigDecimal maxScore,
        AttemptFeedback feedback,
        OffsetDateTime attemptedAt) {
}
