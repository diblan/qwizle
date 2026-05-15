package com.qwizle.api.questions;

import java.time.OffsetDateTime;
import java.util.List;

public record BasicQuestionAttemptResponse(
        Long questionId,
        String submittedAnswer,
        List<String> submittedAnswers,
        boolean correct,
        OffsetDateTime attemptedAt) {
}
