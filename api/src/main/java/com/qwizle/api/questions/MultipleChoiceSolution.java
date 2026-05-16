package com.qwizle.api.questions;

import java.util.List;

public record MultipleChoiceSolution(
        QuestionType type,
        List<String> correctOptionIds) {
}
