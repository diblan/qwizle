package com.qwizle.api.questions;

public record NormalizationRules(
        Boolean trim,
        Boolean caseSensitive,
        Boolean collapseWhitespace) {
    static NormalizationRules defaults() {
        return new NormalizationRules(true, false, true);
    }

    boolean shouldTrim() {
        return trim == null || trim;
    }

    boolean isCaseSensitive() {
        return caseSensitive != null && caseSensitive;
    }

    boolean shouldCollapseWhitespace() {
        return collapseWhitespace == null || collapseWhitespace;
    }
}
