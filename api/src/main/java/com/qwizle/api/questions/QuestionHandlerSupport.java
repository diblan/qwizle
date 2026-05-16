package com.qwizle.api.questions;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

abstract class QuestionHandlerSupport {
    protected List<String> cleanTexts(List<String> values, String fieldName) {
        if (values == null || values.isEmpty()) {
            QuestionValidation.badRequest(fieldName + " are required.");
        }
        return values.stream()
                .map(value -> QuestionValidation.requireCleanText(value, fieldName.substring(0, fieldName.length() - 1)))
                .toList();
    }

    protected List<String> answerTexts(List<TextAnswerDefinition> answers, String fieldName) {
        if (answers == null || answers.isEmpty()) {
            QuestionValidation.badRequest(fieldName + " are required.");
        }
        return answers.stream()
                .map(answer -> QuestionValidation.requireCleanText(answer == null ? null : answer.text(), "Answer"))
                .toList();
    }

    protected void ensureUniqueNormalized(List<String> values, NormalizationRules rules, String message) {
        Set<String> normalizedValues = new LinkedHashSet<>();
        for (String value : values) {
            normalizedValues.add(TextAnswerNormalizer.normalize(value, rules));
        }
        if (normalizedValues.size() != values.size()) {
            QuestionValidation.badRequest(message);
        }
    }

    protected Set<String> normalizedSet(List<String> values, NormalizationRules rules) {
        Set<String> normalizedValues = new LinkedHashSet<>();
        for (String value : values) {
            normalizedValues.add(TextAnswerNormalizer.normalize(value, rules));
        }
        return normalizedValues;
    }

    protected void validateTextContent(ContentBlock content, String fieldName) {
        if (content == null) {
            QuestionValidation.badRequest(fieldName + " content is required.");
        }
        if (content.kind() == null) {
            QuestionValidation.badRequest(fieldName + " content kind is required.");
        }
        if (content.kind() != ContentKind.TEXT) {
            QuestionValidation.badRequest("Only text content is supported for v1.");
        }
        QuestionValidation.requireCleanText(content.text(), fieldName + " text");
    }
}
