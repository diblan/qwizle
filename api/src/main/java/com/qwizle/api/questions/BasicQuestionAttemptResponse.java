package com.qwizle.api.questions;

import java.time.OffsetDateTime;

public record BasicQuestionAttemptResponse(
        Long questionId,
        String submittedAnswer,
        boolean correct,
        OffsetDateTime attemptedAt) {
}
