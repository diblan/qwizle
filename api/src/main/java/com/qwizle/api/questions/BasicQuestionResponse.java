package com.qwizle.api.questions;

import java.time.OffsetDateTime;

public record BasicQuestionResponse(
        Long id,
        String question,
        Long createdByUserId,
        OffsetDateTime createdAt) {
}
