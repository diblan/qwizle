package com.qwizle.api.questions;

import java.util.List;

public record MultipleChoiceDefinition(
        ChoiceSelectionMode selectionMode,
        List<QuestionOption> options,
        List<String> correctOptionIds) {
}
