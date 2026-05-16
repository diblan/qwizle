package com.qwizle.api.questions;

import java.util.List;

public record OptionSelectionInteraction(
        String kind,
        ChoiceSelectionMode selectionMode,
        List<QuestionOption> options) {
}
