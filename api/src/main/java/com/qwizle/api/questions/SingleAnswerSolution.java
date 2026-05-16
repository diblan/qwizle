package com.qwizle.api.questions;

import java.util.List;

public record SingleAnswerSolution(
        QuestionType type,
        List<String> acceptedAnswers) {
}
