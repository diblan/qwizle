package com.qwizle.api.questions;

public record AttemptFeedback(
        String message,
        String explanation,
        Object revealedSolution) {
}
