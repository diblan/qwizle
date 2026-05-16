package com.qwizle.api.questions;

import java.util.List;

public record SingleAnswerDefinition(
        List<TextAnswerDefinition> acceptedAnswers,
        NormalizationRules normalization) {
}
