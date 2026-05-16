package com.qwizle.api.questions;

import java.util.List;

public record MultipleAnswerDefinition(
        MultipleAnswerMode mode,
        List<TextAnswerDefinition> answers,
        NormalizationRules normalization) {
}
