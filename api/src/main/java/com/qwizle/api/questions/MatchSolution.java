package com.qwizle.api.questions;

import java.util.List;

public record MatchSolution(
        QuestionType type,
        List<MatchPair> pairs) {
}
