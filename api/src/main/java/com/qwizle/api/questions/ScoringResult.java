package com.qwizle.api.questions;

import java.math.BigDecimal;

public record ScoringResult(
        boolean correct,
        BigDecimal score,
        BigDecimal maxScore,
        String message,
        Object revealedSolution) {
    static ScoringResult allOrNothing(boolean correct, Object revealedSolution) {
        return new ScoringResult(
                correct,
                correct ? BigDecimal.ONE : BigDecimal.ZERO,
                BigDecimal.ONE,
                correct ? "Correct." : "Not quite.",
                revealedSolution);
    }
}
