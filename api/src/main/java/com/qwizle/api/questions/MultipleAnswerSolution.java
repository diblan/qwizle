package com.qwizle.api.questions;

import java.util.List;

public record MultipleAnswerSolution(
        QuestionType type,
        MultipleAnswerMode mode,
        List<String> answers) {
}
