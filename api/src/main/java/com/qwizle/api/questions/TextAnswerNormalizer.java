package com.qwizle.api.questions;

import java.util.Locale;

final class TextAnswerNormalizer {
    private TextAnswerNormalizer() {
    }

    static String normalize(String value, NormalizationRules rules) {
        NormalizationRules effectiveRules = rules == null ? NormalizationRules.defaults() : rules;
        String normalized = value == null ? "" : value;
        if (effectiveRules.shouldTrim()) {
            normalized = normalized.trim();
        }
        if (effectiveRules.shouldCollapseWhitespace()) {
            normalized = normalized.replaceAll("\\s+", " ");
        }
        if (!effectiveRules.isCaseSensitive()) {
            normalized = normalized.toLowerCase(Locale.ROOT);
        }
        return normalized;
    }
}
